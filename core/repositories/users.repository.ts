import { UsersMapper } from "../mappers/users.mapper";
import { UserRole } from "../types/orders.types";
import { User } from "../types/users.types";
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

  async createUser(user: User, roleName: UserRole): Promise<User> {
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

    const roleId = await this.findRoleByName(roleName);

    await this.createUserRole(data.id, roleId);

    return UsersMapper.dbToUser(data);
  }

  async createUserRole(userId: string, roleId: string) {
    const { error } = await this.supabase.from("users_roles").insert({
      user_id: userId,
      role_id: roleId,
    });
    if (error) {
      throw new Error(`Error creating this user with this role: ${error.message}`);
    }
  }

  async findRoleByName(name: string): Promise<string> {
    const { data, error } = await this.supabase.from("roles").select("id").eq("name", name).limit(1);

    if (error) {
      throw new Error(`Error finding this role: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(`Role '${name}' not found in database. Please ensure roles are properly seeded.`);
    }

    return data[0].id;
  }

  async updateUser(userId: string): Promise<User> {
    const { data, error } = await this.supabase
      .from("users")
      .update({
        last_login_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }

    return UsersMapper.dbToUser(data);
  }
  async getRoleIdByUserId(userId: string): Promise<string> {
    const { data, error } = await this.supabase.from("users_roles").select("role_id").eq("user_id", userId).limit(1);

    if (error) {
      throw new Error(`Error getting role Id: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(`No role found for user ${userId}`);
    }
    return data[0].role_id;
  }

  async getRoleNameByRoleId(roleId: string): Promise<UserRole> {
    const { data, error } = await this.supabase.from("roles").select("name").eq("id", roleId).single();
    if (error) {
      throw new Error(`Error getting role name: ${error.message}`);
    }
    return data.name as UserRole;
  }
}
