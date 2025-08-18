/* eslint-disable @typescript-eslint/no-explicit-any */
import {createClient} from "@supabase/supabase-js";
import {AuthUserDto} from '../dto/auth.dto';
import {User, UserRole} from '../types/orders.types';


export class UsersRepository {
    private supabase;

    constructor() {
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }

    async findUserByPrivyId(privyId: string): Promise<User> {
        const {data} = await this.supabase
            .from('users')
            .select('*')
            .eq('privy_id', privyId)
            .single();

        return this.mapDbToUser(data);
    }

    async findUserById(userId: string): Promise<User> {
        const {data} = await this.supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        return this.mapDbToUser(data);
    }


    async createUser(authUserDto: AuthUserDto, roleName: UserRole): Promise<User> {
        const {data, error} = await this.supabase
            .from('users')
            .insert({
                privy_id: authUserDto.privyId,
                email: authUserDto.email,
                name: authUserDto.name,
                wallet: authUserDto.wallet,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }

        const roleId = await this.findRoleByName(roleName);

        await this.createUserRole(data.id, roleId);

        return this.mapDbToUser(data);
    }

    async createUserRole(userId: string, roleId: string) {
        const { error} = await this.supabase
            .from('users_roles')
            .insert({
                user_id: userId,
                role_id: roleId,
            })
        if (error) {
            throw new Error(`Error creating this user with this role: ${error.message}`);
        }
    }

    async findRoleByName(name: string): Promise<string> {
        const {data, error} = await this.supabase
            .from('roles')
            .select('id')
            .eq('name', name)
            .single();
        if (error) {
            throw new Error(`Error finding this role: ${error.message}`);
        }
        return data.id;
    }

    async updateUser(userId: string): Promise<User> {
        const {data, error} = await this.supabase
            .from('users')
            .update({
                last_login_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }

        return this.mapDbToUser(data)
    }

    private mapDbToUser(dbUser: any): User {
        return {
            id: dbUser.id,
            name: dbUser.name,
            walletAddress: dbUser.wallet,
            email: dbUser.email,
            country: dbUser.country,
            bankName: dbUser.bank_name,
            accountNumber: dbUser.account_number,
            accountHolder: dbUser.account_holder,
            phone: dbUser.phone,
            availableBalance: dbUser.available_balance,
            lastLoginAt: dbUser.last_login_at,
            createdAt: dbUser.created_at,
            updatedAt: dbUser.updated_at,
        };
    }


}