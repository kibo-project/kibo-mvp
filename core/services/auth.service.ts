import {AuthRepository} from '../repositories/auth.repository';
import {UsersRepository} from '../repositories/users.repository';
import {User} from '../types/users.types'
import { UsersMapper } from "../mappers/users.mapper";

import { generateToken } from "../../utils/auth/jwt";


export class AuthService {
    private authRepository: AuthRepository;
    private usersRepository: UsersRepository;

    constructor() {
        this.authRepository = new AuthRepository();
        this.usersRepository = new UsersRepository();
    }

    async login(token: string) {
        const privyUser = await this.authRepository.verifyPrivyToken(token);
        let role;
        let user = await this.usersRepository.findUserByPrivyId(privyUser.privyId!);
        if (user) {
            user = await this.usersRepository.updateUser(user.id!);
            role = await this.usersRepository.getRoleIdByUserId(user.id!);
            role = await this.usersRepository.getRoleNameByRoleId(role)


        } else {
            user = await this.usersRepository.createUser(privyUser, "user");
            role = "user"
        }
        const jwtToken = await generateToken(user.id!, user.privyId!, role);

        return {
            userResponse: UsersMapper.userToUserResponse(user),
            token: jwtToken,
        };
    }

    async getProfile(userId: string): Promise<User | null> {
        const user = await this.usersRepository.findUserById(userId);
        return user;
    }
}