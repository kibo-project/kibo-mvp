/* eslint-disable @typescript-eslint/no-explicit-any */
import {createClient} from "@supabase/supabase-js";
import {User} from "@/core/types/users.types";
import { UsersMapper } from "../mappers/users.mapper";

export class AuthRepository {
    private supabase;

    constructor() {
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }
    async verifyPrivyToken(token: string): Promise<User> {
        const response = await fetch("https://auth.privy.io/api/v1/users/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "privy-app-id": process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Invalid Token");
            }
            throw new Error(`Error verifying token: ${response.status}`);
        }
        const userData = await response.json();

        return UsersMapper.privyUserToUser(userData);
    }


}