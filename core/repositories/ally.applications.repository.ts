import { AllyApplicationsMapper } from "@/core/mappers/ally.applications.mapper";
import { OrderMapper } from "@/core/mappers/order.mapper";
import { AllyApplication, AllyApplicationDto, ApplicationsFiltersRequest } from "@/core/types/ally.applications.types";
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

  async getApplications(
    filters: ApplicationsFiltersRequest
  ): Promise<{ applications: AllyApplication[]; total: number }> {
    let query = this.supabase.from("ally_applications").select("*", { count: "exact" });
    if (filters.status) {
      query = query.eq("status", filters.status);
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

  async approveApplication(applicationId: string, adminId: string): Promise<AllyApplication> {
    const { data, error } = await this.supabase
      .from("ally_applications")
      .update({
        status: "APPROVE",
        updated_at: new Date().toISOString(),
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", applicationId);
    if (error) {
      throw new Error(`Error approving application: ${error.message}`);
    }
    return AllyApplicationsMapper.dbToAllyApplication(data);
  }

  async findById(applicationId: string): Promise<AllyApplication | null> {
    const { data, error } = await this.supabase.from("ally_applications").select("id").eq("id", applicationId).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to find order: ${error.message}`);
    }

    return AllyApplicationsMapper.dbToAllyApplication(data);
  }
}
