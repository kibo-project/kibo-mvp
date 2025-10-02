import { UsersMapper } from "../mappers/users.mapper";
import { UserRole } from "../types/orders.types";
import { User, UserProfileRequest, UserResponse, UsersFiltersDto } from "../types/users.types";
import { createClient } from "@supabase/supabase-js";

export class UsersRepository {
  private supabase;

  constructor() {
    this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }

  async findUserByPrivyId(privyId: string): Promise<User | null> {
    const { data } = await this.supabase.from("users").select("*").eq("privy_id", privyId).single();

    return data ? UsersMapper.dbToUser(data) : null;
  }

  async findUserIdByWallet(wallet: string): Promise<string | null> {
    const { data, error } = await this.supabase.from("users").select("id").eq("wallet", wallet).maybeSingle();

    return data && !error ? data.id : null;
  }
  async getUsers(filters: UsersFiltersDto): Promise<{ users: UserResponse[]; total: number }> {
    let query = this.supabase.from("users").select(
      `
    *,
    users_roles ${filters.role ? "!inner" : ""} (
      roles ${filters.role ? "!inner" : ""} (*)
    )
  `,
      { count: "exact" }
    );

    if (filters.role) {
      query = query.eq("users_roles.roles.name", filters.role);
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(
        `name.ilike.${searchTerm},` +
          `email.ilike.${searchTerm},` +
          `wallet.ilike.${searchTerm},` +
          `phone.ilike.${searchTerm}`
      );
    }

    query = query.range(filters.offset, filters.offset + filters.limit - 1).order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    const users: UserResponse[] = data?.map(userData => UsersMapper.dbToUserResponse(userData)) || [];

    return {
      users,
      total: count || 0,
    };
  }

  async findUserById(userId: string): Promise<User | null> {
    const { data } = await this.supabase.from("users").select("*").eq("id", userId).single();

    return data ? UsersMapper.dbToUser(data) : null;
  }

  async getActiveRoleIdByUserId(userId: string): Promise<string | null> {
    const { data, error } = await this.supabase.from("users").select("active_role_id").eq("id", userId).single();

    if (error || !data) {
      console.log(`User '${userId}' does not have an active role id`);
    }
    return data!.active_role_id;
  }

  async createUser(user: User): Promise<User> {
    const { data, error } = await this.supabase
      .from("users")
      .insert({
        privy_id: user.privyId,
        email: user.email,
        wallet: user.walletAddress,
        created_at: user.createdAt,
        last_login_at: user.lastLoginAt,
        active_role_id: user.activeRoleId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
    const roleId = await this.findRoleIdByName("user");
    await this.createUserRole(data.id, roleId, true);

    return UsersMapper.dbToUser(data);
  }

  async createUserRole(userId: string, roleId: string, isActive: boolean) {
    const { error } = await this.supabase.from("users_roles").insert({
      user_id: userId,
      role_id: roleId,
      is_active: isActive,
    });
    if (error) {
      throw new Error(`Error creating this user with this role: ${error.message}`);
    }
  }

  async findRoleIdByName(name: UserRole): Promise<string> {
    const { data, error } = await this.supabase.from("roles").select("id").eq("name", name).limit(1);

    if (error) {
      throw new Error(`Error finding this role: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(`Role '${name}' not found in database. Please ensure roles are properly seeded.`);
    }

    return data[0].id;
  }

  async updateUserToApplicant(userId: string, isApplicant: boolean) {
    const { error } = await this.supabase
      .from("users")
      .update({
        is_an_applicant: isApplicant,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async updateUser(userId: string, newActiveRoleId?: string): Promise<User> {
    const { data, error } = await this.supabase
      .from("users")
      .update({
        last_login_at: new Date().toISOString(),
        active_role_id: newActiveRoleId,
      })
      .eq("id", userId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Error updating user`);
    }

    return UsersMapper.dbToUser(data);
  }

  async updateUserRole(userId: string, newActiveRoleId: string): Promise<void> {
    await this.supabase.from("users_roles").update({ is_active: false }).eq("user_id", userId);

    await this.supabase
      .from("users_roles")
      .update({ is_active: true })
      .eq("user_id", userId)
      .eq("role_id", newActiveRoleId);
  }

  async editUserProfile(userId: string, userProfileRequest: UserProfileRequest): Promise<User | null> {
    const updateFields: any = {
      updated_at: new Date().toISOString(),
    };

    if (userProfileRequest.name !== undefined) {
      updateFields.name = userProfileRequest.name;
    }

    if (userProfileRequest.email !== undefined) {
      updateFields.email = userProfileRequest.email;
    }

    if (userProfileRequest.phone !== undefined) {
      updateFields.phone = userProfileRequest.phone;
    }

    const { data, error } = await this.supabase.from("users").update(updateFields).eq("id", userId).select().single();

    if (error) {
      return null;
    }

    if (!data) {
      throw new Error(`User with id ${userId} not found`);
    }

    return UsersMapper.dbToUser(data);
  }

  async getRoleIdsByUserId(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase.from("users_roles").select("role_id").eq("user_id", userId);

    if (error) {
      throw new Error(`Error getting role Id: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(`No role found for user ${userId}`);
    }
    return data.map(row => row.role_id);
  }

  async getRoleNameByRoleId(roleId: string): Promise<UserRole> {
    const { data, error } = await this.supabase.from("roles").select("name").eq("id", roleId).single();
    if (error) {
      throw new Error(`Error getting role name: ${error.message}`);
    }
    return data.name as UserRole;
  }

  async verifyUser(userId: string, rolename: string) {
    const { data: roles, error: roleError } = await this.supabase
      .from("roles")
      .select("*")
      .eq("name", rolename)
      .limit(1);

    if (roleError || !roles || roles.length === 0) {
      console.log(`Role '${rolename}' not found`);
      return false;
    }
    const role = roles[0];

    const { data: userRole, error: userRoleError } = await this.supabase
      .from("users_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role_id", role.id)
      .limit(1);

    if (!userRole || userRole.length === 0 || userRoleError) {
      console.log(`User ${userId} doesn't have role ${rolename}, checking if user exists`);
      return false;
    }

    return true;
  }

  async verifyUser2(userId: string, roleId: string) {
    const { data: userRole, error: userRoleError } = await this.supabase
      .from("users_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role_id", roleId)
      .limit(1);
    if (!userRole || userRole.length === 0 || userRoleError) {
      return false;
    }

    return true;
  }

  async getUserRolesByWallet(wallet: string): Promise<UserResponse> {
    const { data, error } = await this.supabase
      .from("users")
      .select(`*,  users_roles ( is_active, roles (*))`)
      .eq("wallet", wallet)
      .order("is_active", { ascending: false, referencedTable: "users_roles" })
      .maybeSingle();

    if (error || !data) {
      throw new Error(`User not found: ${error}`);
    }

    return UsersMapper.dbToUserResponse2(data);
  }
  async getUserRolesByUserId(userId: string): Promise<UserResponse> {
    const { data, error } = await this.supabase
      .from("users")
      .select(`*,  users_roles (roles (*))`)
      .eq("id", userId)
      .order("is_active", { ascending: false, referencedTable: "users_roles" })
      .maybeSingle();

    if (error || !data) {
      throw new Error(`User not found: ${error}`);
    }
    return UsersMapper.dbToUserResponse2(data);
  }
}
