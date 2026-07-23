import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Send, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { GreetingHero, Panel, ProducerSubmitModal } from '@modules/shared-ui';
import { useAdminJobById, useAdminJobFiles, useAdminJobImageUrls, isAdminViewableImage } from '@modules/admin-panel/hooks/use-admin-jobs';
import { RejectionFeedback } from '@modules/admin-panel/components/RejectionFeedback';
import { adminService } from '@modules/admin-panel/services/admin.service';
import { toastApiError } from '@lib/toast-error';
import { queryKeys } from '@lib/query-keys';
import { useQueryClient } from '@tanstack/react-query';
import { FileCategory } from '@contracts';
import { FileGrid } from './FileGrid';

const ACTIVE_STATUSES = new Set(['ASSIGNED', 'IN_PROGRESS']);
const REWORK_STATUSES = new Set(['TEAM_LEAD_REJECTED', 'QC_REJECTED']);

/**
 * Per-job producer workspace — Designer/Digitator/Sewout share this one page
 * (ChangeArt-New-PRD.md §5.4/§5.5/§5.6/§5.7): brief on the left, Original
 * Files vs Completed Files (with version history) side-by-side on the
 * right, feedback banner if rejected, and Accept/Submit/Rework actions.
 */
export function JobWorkspacePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showSubmit, setShowSubmit] = useState(false);
  const [pending, setPending] = useState(false);

  const { data: job, isLoading } = useAdminJobById(jobId ?? '');
  const { data: files } = useAdminJobFiles(job?.uuid);

  const originalFiles = useMemo(() => (files ?? []).filter((f) => f.file_category === FileCategory.ORIGINAL), [files]);
  const completedFiles = useMemo(
    () => (files ?? []).filter((f) => f.file_category === FileCategory.COMPLETED).sort((a, b) => b.version_number - a.version_number),
    [files],
  );
  const originalImageFiles = useMemo(() => originalFiles.filter(isAdminViewableImage), [originalFiles]);
  const completedImageFiles = useMemo(() => completedFiles.filter(isAdminViewableImage), [completedFiles]);

  const { data: originalUrls } = useAdminJobImageUrls(job?.uuid, originalImageFiles);
  const { data: completedUrls } = useAdminJobImageUrls(job?.uuid, completedImageFiles);

  if (isLoading || !job || !job.uuid) {
    return (
      <div className="page">
        <GreetingHero title="Job Workspace" subtitle="Loading…" />
      </div>
    );
  }

  const isSewoutOrder = job.order === 'Digitizing + Sewout';
  const isActive = !!job.rawStatus && ACTIVE_STATUSES.has(job.rawStatus);
  const isRework = !!job.rawStatus && REWORK_STATUSES.has(job.rawStatus);
  const isJuniorAssigned = job.subType === 'Junior';
  const isSewoutStage = job.rawStatus === 'SUBMITTED_TO_SEWOUT' || job.rawStatus === 'SEWOUT_IN_PROGRESS';

  const handleAccept = async () => {
    if (job.version == null) return;
    setPending(true);
    try {
      const action = isSewoutStage ? 'sewout_accept' : 'accept';
      await adminService.transitionJob(job.uuid!, action, job.version);
      toast.success('Accepted.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byId(job.uuid!) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() });
    } catch (err) {
      toastApiError(err);
    } finally {
      setPending(false);
    }
  };

  const handleStartRework = async () => {
    if (job.version == null) return;
    setPending(true);
    try {
      const action = job.rawStatus === 'QC_REJECTED' ? 'rework_after_qc' : 'rework';
      await adminService.transitionJob(job.uuid!, action, job.version);
      toast.success('Moved back to In Progress — revise and resubmit.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byId(job.uuid!) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() });
    } catch (err) {
      toastApiError(err);
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = async (_uploadedFileIds: string[], stitchCount?: number) => {
    if (job.version == null) return;
    if (isSewoutStage) {
      await adminService.transitionJobWithStitchCount(job.uuid!, 'sewout_submit', job.version, stitchCount);
      toast.success('Submitted to QC.');
    } else {
      const isJunior = isJuniorAssigned;
      const action = isJunior ? 'submit_to_team_lead' : isSewoutOrder ? 'senior_direct_to_sewout' : 'senior_direct_submit';
      await adminService.transitionJob(job.uuid!, action, job.version);
      toast.success(isJunior ? 'Submitted to Team Lead.' : isSewoutOrder ? 'Routed to Sewout.' : 'Submitted to QC.');
    }
    void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byId(job.uuid!) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() });
  };

  return (
    <div className="page">
      <button type="button" className="btn btn-outline mb-3" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
        Back
      </button>

      <GreetingHero title={job.design} subtitle={`${job.ref} · ${job.order}`} />

      {isRework ? <RejectionFeedback jobId={job.uuid} /> : null}

      <div className="two-col">
        <div className="flex flex-col gap-3">
          <Panel title="Brief">
            <dl className="text-[12.5px] space-y-2">
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">Priority</dt>
                <dd className="font-semibold">{job.priority}</dd>
              </div>
              {job.etaHours != null ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">ETA</dt>
                  <dd className="font-semibold">{job.etaHours}h</dd>
                </div>
              ) : null}
              {job.placement ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">Placement</dt>
                  <dd className="font-semibold">{job.placement}</dd>
                </div>
              ) : null}
              {job.width != null && job.height != null ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">Dimensions</dt>
                  <dd className="font-semibold">{job.width}&quot; × {job.height}&quot;</dd>
                </div>
              ) : null}
              {job.fabric ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">Fabric</dt>
                  <dd className="font-semibold">{job.fabric}</dd>
                </div>
              ) : null}
              {job.colors != null ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">Colors</dt>
                  <dd className="font-semibold">{job.colors}</dd>
                </div>
              ) : null}
              {job.stitchCount != null ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">Stitch Count</dt>
                  <dd className="font-semibold">{job.stitchCount.toLocaleString()}</dd>
                </div>
              ) : null}
            </dl>
            {job.summary || job.notes ? (
              <div className="mt-3 pt-3 border-t border-border text-[12px] text-text-muted whitespace-pre-wrap">
                {job.summary || job.notes}
              </div>
            ) : null}
          </Panel>

          <div className="job-actions flex-wrap">
            {job.rawStatus === 'ASSIGNED' || (isSewoutStage && job.rawStatus === 'SUBMITTED_TO_SEWOUT') ? (
              <button type="button" className="btn btn-crimson" disabled={pending} onClick={handleAccept}>
                <Play className="w-3.5 h-3.5" aria-hidden />
                Accept
              </button>
            ) : null}
            {isActive || job.rawStatus === 'SEWOUT_IN_PROGRESS' ? (
              <button type="button" className="btn btn-crimson" disabled={pending} onClick={() => setShowSubmit(true)}>
                <Send className="w-3.5 h-3.5" aria-hidden />
                Submit
              </button>
            ) : null}
            {isRework ? (
              <button type="button" className="btn btn-outline" disabled={pending} onClick={handleStartRework}>
                <RotateCcw className="w-3.5 h-3.5" aria-hidden />
                Start Rework
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Panel title="Original Files">
            <FileGrid
              imageFiles={originalImageFiles}
              imageUrls={originalUrls ?? []}
              otherFiles={originalFiles.filter((f) => !isAdminViewableImage(f))}
            />
          </Panel>

          <Panel title={`Completed Files${completedFiles.length ? ` (v${completedFiles[0]?.version_number ?? 1})` : ''}`}>
            {completedFiles.length === 0 ? (
              <div className="text-[12px] text-text-faint italic">No completed files uploaded yet.</div>
            ) : (
              <>
                <FileGrid
                  imageFiles={completedImageFiles}
                  imageUrls={completedUrls ?? []}
                  otherFiles={completedFiles.filter((f) => !isAdminViewableImage(f))}
                />
                {completedFiles.length > 1 ? (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-text-muted mb-1.5">
                      Version History
                    </div>
                    <ul className="text-[11.5px] text-text-muted space-y-1">
                      {completedFiles.map((f) => (
                        <li key={f.id} className="flex items-center justify-between gap-2">
                          <span className="truncate">v{f.version_number} — {f.file_name}</span>
                          <span className="shrink-0">{new Date(f.created_at).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </Panel>
        </div>
      </div>

      {showSubmit ? (
        <ProducerSubmitModal
          jobUuid={job.uuid}
          jobLabel={job.id}
          title={isSewoutStage ? 'Submit Sewout to QC' : 'Submit Completed Work'}
          confirmLabel={isSewoutStage ? 'Submit to QC' : 'Submit'}
          requireStitchCount={isSewoutStage}
          onClose={() => setShowSubmit(false)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
