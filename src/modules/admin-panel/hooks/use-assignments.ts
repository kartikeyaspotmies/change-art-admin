import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { queryKeys } from '@lib/query-keys';
import { toastApiError } from '@lib/toast-error';
import { assignmentsApi, type CreateAssignmentBody } from '../services/assignments.service';

export function useAssignJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAssignmentBody) => assignmentsApi.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.jobs.all() });
      toast.success('Job assigned.');
    },
    onError: (err) => toastApiError(err),
  });
}
