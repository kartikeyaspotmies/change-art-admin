import { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { uploadCompletedFile } from '@modules/cs-panel/services/cs-quote.service';
import toast from 'react-hot-toast';

interface ProducerSubmitModalProps {
  jobUuid: string;
  jobLabel: string;
  title: string;
  confirmLabel: string;
  /** Sewout submission requires a mandatory stitch count (backend-enforced > 0). */
  requireStitchCount?: boolean;
  onClose: () => void;
  /** Called with uploaded file IDs (may be empty) and stitch count (if required) after files finish uploading. */
  onSubmit: (uploadedFileIds: string[], stitchCount?: number) => Promise<void>;
}

/**
 * Shared "upload completed work + submit" modal for Designer/Digitator/Sewout
 * producer workspaces. Reuses `uploadCompletedFile` (already shipped for CS's
 * Mark Complete flow) rather than building a second upload pipeline.
 */
export function ProducerSubmitModal({
  jobUuid,
  jobLabel,
  title,
  confirmLabel,
  requireStitchCount = false,
  onClose,
  onSubmit,
}: ProducerSubmitModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [stitchCount, setStitchCount] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadIndex, setUploadIndex] = useState(0);

  const stitchValid = !requireStitchCount || (Number(stitchCount) > 0 && Number.isFinite(Number(stitchCount)));
  const canSubmit = !uploading && stitchValid;

  const handleFilePick = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!stitchValid) return;
    setUploading(true);
    try {
      const uploadedIds: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setUploadIndex(i + 1);
        const id = await uploadCompletedFile(jobUuid, files[i]);
        uploadedIds.push(id);
      }
      await onSubmit(uploadedIds, requireStitchCount ? Number(stitchCount) : undefined);
      onClose();
    } catch {
      toast.error('Submit failed — please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/55"
      onClick={(e) => { if (e.target === e.currentTarget && !uploading) onClose(); }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[560px] max-h-[85vh] rounded-2xl flex flex-col overflow-hidden bg-white"
      >
        <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono font-bold text-crimson">{jobLabel}</div>
              <h2 className="text-[16px] font-extrabold text-text mt-0.5">{title}</h2>
            </div>
            <button type="button" onClick={onClose} disabled={uploading} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <label className="block text-[10px] font-bold uppercase tracking-wide text-text-muted mb-1.5">
            Completed Files {files.length === 0 ? '(optional)' : `(${files.length})`}
          </label>
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-6 cursor-pointer text-[12px] text-text-muted">
            <Upload className="w-4 h-4" aria-hidden />
            Click to select files
            <input type="file" multiple className="hidden" onChange={(e) => handleFilePick(e.target.files)} disabled={uploading} />
          </label>

          {files.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {files.map((f, i) => (
                <li key={f.name + f.size} className="flex items-center justify-between text-[11.5px] px-2 py-1.5 rounded border border-border">
                  <span className="truncate">{f.name}</span>
                  <button type="button" className="text-crimson font-semibold" onClick={() => removeFile(i)} disabled={uploading}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {requireStitchCount ? (
            <div className="mt-4">
              <label className="block text-[10px] font-bold uppercase tracking-wide text-text-muted mb-1.5">
                Stitch Count (required)
              </label>
              <input
                type="number"
                min={1}
                value={stitchCount}
                onChange={(e) => setStitchCount(e.target.value)}
                disabled={uploading}
                className="w-full border border-border rounded-lg px-3 py-2 text-[13px]"
                placeholder="e.g. 14200"
              />
            </div>
          ) : null}
        </div>

        <div className="flex-shrink-0 flex items-center justify-end gap-2 px-6 py-3.5 border-t border-border">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button type="button" className="btn btn-crimson" onClick={handleSubmit} disabled={!canSubmit}>
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                Uploading {uploadIndex}/{files.length}…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
