import { AllyApplication, ApplicationStatus } from "@/core/types/ally.applications.types";

export class AllyApplicationsMapper {
  static dbToAllyApplication(dbAllyApplication: any): AllyApplication {
    return {
      id: dbAllyApplication.id,
      userId: dbAllyApplication.user_id,
      fullName: dbAllyApplication.full_name,
      phone: dbAllyApplication.phone,
      address: dbAllyApplication.address,
      status: dbAllyApplication.status as ApplicationStatus,
      createdAt: dbAllyApplication.created_at,
      updatedAt: dbAllyApplication.updated_at ? new Date(dbAllyApplication.updated_at) : undefined,
      reviewedAt: dbAllyApplication.reviewed_at ? new Date(dbAllyApplication.reviewed_at) : undefined,
      reviewedBy: dbAllyApplication.reviewed_by ?? undefined,
      rejectionReason: dbAllyApplication.rejection_reason ?? undefined,
    };
  }
}
