import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import type { Order } from "@/types/portal";

export type AssignmentBucket = "new" | "active" | "completed" | "cancelled";

const BUCKET_STATUS: Record<AssignmentBucket, string> = {
  new: "assigned",
  active: "in-progress",
  completed: "completed",
  cancelled: "cancelled",
};

export interface AssignmentFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function assignmentsQueryOptions(bucket: AssignmentBucket, filters: AssignmentFilters = {}) {
  return {
    queryKey: ["assignments", bucket, filters] as const,
    queryFn: async (): Promise<Order[]> => {
      const { data } = await api.get("/orders", {
        params: {
          assigned_to: "me",
          status: BUCKET_STATUS[bucket],
          search: filters.search || undefined,
          date_from: filters.dateFrom || undefined,
          date_to: filters.dateTo || undefined,
          limit: 50,
          page: 1,
        },
      });
      return data?.orders ?? data?.data?.orders ?? [];
    },
  };
}

export function useAssignments(bucket: AssignmentBucket, filters: AssignmentFilters = {}) {
  return useQuery(assignmentsQueryOptions(bucket, filters));
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async (): Promise<Order> => {
      const { data } = await api.get(`/orders/${orderId}`);
      return data?.order ?? data;
    },
    enabled: Boolean(orderId),
  });
}
