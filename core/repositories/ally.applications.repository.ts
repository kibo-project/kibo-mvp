import { AllyApplicationsMapper } from "@/core/mappers/ally.applications.mapper";
import {
  AllyApplication,
  AllyApplicationDto,
  ApplicationStatus,
  ApplicationsFiltersDto,
} from "@/core/types/ally.applications.types";
import { createClient } from "@supabase/supabase-js";

export class AllyApplicationsRepository {
  private supabase;

  constructor() {
    this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }

  async verifyOneApplication(userId: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from("ally_applications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "PENDING");

    if (error) {
      throw new Error(`Error checking application: ${error.message}`);
    }
    return (count ?? 0) === 0;
  }

  async createApplication(allyApplicationDto: AllyApplicationDto): Promise<AllyApplication> {
    const { data, error } = await this.supabase
      .from("ally_applications")
      .insert({
        user_id: allyApplicationDto.userId,
        full_name: allyApplicationDto.fullName,
        status: allyApplicationDto.status,
        phone: allyApplicationDto.phone,
        address: allyApplicationDto.address,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Error creating application: ${error.message}`);
    }
    return AllyApplicationsMapper.dbToAllyApplication(data);
  }

  async getApplicationByUserId(userId: string): Promise<AllyApplication> {
    const { data, error } = await this.supabase
      .from("ally_applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw new Error(`Error fetching application: ${error.message}`);
    }
    return AllyApplicationsMapper.dbToAllyApplication(data);
  }

  async getApplications(filters: ApplicationsFiltersDto): Promise<{ applications: AllyApplication[]; total: number }> {
    let query = this.supabase.from("ally_applications").select("*", { count: "exact" });
    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;

      const numericSearch = parseFloat(filters.search);

      if (!isNaN(numericSearch)) {
        query = query.or(`phone.eq.${numericSearch},`);
      } else {
        query = query.or(`full_name.ilike.${searchTerm},` + `address.ilike.${searchTerm}`);
      }
    }
    query = query.range(filters.offset, filters.offset + filters.limit - 1);
    query = query.order("created_at", { ascending: false });
    const { data, error, count } = await query;
    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }
    return {
      applications: data.map(AllyApplicationsMapper.dbToAllyApplication),
      total: count || 0,
    };
  }

  async updateStatus(
    id: string,
    status: ApplicationStatus,
    reviewedBy: string,
    updates?: Partial<{
      updatedAt: string;
      reviewedAt: string;
      rejectionReason: string;
    }>
  ): Promise<AllyApplication> {
    const updateData: any = { status, reviewed_by: reviewedBy };
    if (updates?.updatedAt) updateData.updated_at = updates.updatedAt;
    if (updates?.reviewedAt) updateData.reviewed_at = updates.reviewedAt;
    if (updates?.rejectionReason) updateData.rejection_reason = updates.rejectionReason;
    const { data, error } = await this.supabase
      .from("ally_applications")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      throw new Error(`Failed to update application status: ${error.message}`);
    }
    return AllyApplicationsMapper.dbToAllyApplication(data);
  }

  async findById(applicationId: string): Promise<AllyApplication | null> {
    const { data, error } = await this.supabase.from("ally_applications").select("*").eq("id", applicationId).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to find order: ${error.message}`);
    }

    return AllyApplicationsMapper.dbToAllyApplication(data);
  }
}
