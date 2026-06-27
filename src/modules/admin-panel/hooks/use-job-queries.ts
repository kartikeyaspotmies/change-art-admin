import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@lib/query-keys';
import { jobQueriesService } from '../services/job-queries.service';

export function useJobQueries(jobCardId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.queries.forJob(jobCardId ?? ''),
    queryFn: () => jobQueriesService.listForJob(jobCardId!),
    enabled: !!jobCardId,
    staleTime: 0,
  });
}

export function useRaiseQuery(jobCardId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => jobQueriesService.raiseQuery(jobCardId!, message),
    onSuccess: () => {
      if (jobCardId) {
        void qc.invalidateQueries({ queryKey: queryKeys.queries.forJob(jobCardId) });
      }
    },
  });
}
