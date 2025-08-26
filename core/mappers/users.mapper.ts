/* eslint-disable @typescript-eslint/no-explicit-any */
import {User} from "@/core/types/users.types";


export class UsersMapper {

    static dbToUser(dbUser: any): User {
        return {
            id: dbUser.id,
            privyId: dbUser.privyId,
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

    static privyUserToUser(privyResponse: any): User {
        const privyUser = privyResponse.user;

        const emailAccount = privyUser.linked_accounts.find(
            (acc: any) => acc.type === "email"
        );

        const walletAccount = privyUser.linked_accounts.find(
            (acc: any) => acc.type === "wallet"
        );

        return {
            privyId: privyUser.id,
            email: emailAccount?.address,
            walletAddress: walletAccount?.address,
            createdAt: new Date(privyUser.created_at * 1000).toISOString(),
            lastLoginAt: new Date(),
            name: undefined,
            country: undefined,
            bankName: undefined,
            accountNumber: undefined,
            accountHolder: undefined,
            phone: undefined,
            availableBalance: undefined,
            updatedAt: undefined,
            role: undefined,
            reputation: undefined,
            successfulOrders: undefined,
            lastActive: undefined,
        };
    }
}