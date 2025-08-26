import {AuthRepository} from '../repositories/auth.repository';
import {UsersRepository} from '../repositories/users.repository';
import {User} from '../types/users.types'
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

        let user = await this.usersRepository.findUserByPrivyId(privyUser.privyId!);
        if (user) {
            user = await this.usersRepository.updateUser(user.id!);
        } else {
            user = await this.usersRepository.createUser(privyUser, "user");
        }
        const jwtToken = await generateToken(user.id!, user.email!);

        return {
            user: user,
            token: jwtToken,
        };
    }

    async getProfile(userId: string): Promise<User | null> {
        const user = await this.usersRepository.findUserById(userId);
        return user;
    }
}