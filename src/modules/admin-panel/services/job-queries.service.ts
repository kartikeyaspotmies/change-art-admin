import { apiClient } from '@lib/api-client';
import type { IJobQuery } from '@contracts';

export const jobQueriesService = {
  listForJob(jobCardId: string): Promise<IJobQuery[]> {
    return apiClient.get<IJobQuery[]>(`/api/v1/job-cards/${jobCardId}/queries`);
  },

  raiseQuery(jobCardId: string, message: string): Promise<IJobQuery> {
    return apiClient.post<IJobQuery>(`/api/v1/job-cards/${jobCardId}/queries`, { message });
  },
};
