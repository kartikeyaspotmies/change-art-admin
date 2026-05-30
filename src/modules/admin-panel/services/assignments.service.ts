import { apiClient } from '@lib/api-client';

export interface CreateAssignmentBody {
  job_card_id: string;       // backend UUID of the job card
  assigned_to: string;       // backend UUID of the assignee user
  deadline?: string;         // ISO 8601, optional
  notes?: string;            // optional brief to the assignee
}

/**
 * Thin client for the CS / TL / Admin assignment endpoints.
 * The actual notification fan-out + socket emissions happen server-side
 * (see assignments.service.ts on the backend).
 */
export const assignmentsApi = {
  create(body: CreateAssignmentBody) {
    return apiClient.post<unknown, CreateAssignmentBody>('/api/v1/assignments', body);
  },
};
