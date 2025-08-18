import {AuthRepository} from '../repositories/auth.repository';
import {UsersRepository} from '../repositories/users.repository';
import {AuthUserDto} from '../dto/auth.dto';
import { generateToken } from "../../utils/auth/jwt";


export class AuthService {
    private authRepository: AuthRepository;
    private usersRepository: UsersRepository;

    constructor() {
        this.authRepository = new AuthRepository();
        this.usersRepository = new UsersRepository();
    }

    async login(authUserDto: AuthUserDto) {
        const privyUser = await this.authRepository.verifyPrivyToken(authUserDto.token);
        if (privyUser.privyId !== authUserDto.privyId) {
            throw new Error("Token does not match user");
        }
        let user = await this.usersRepository.findUserByPrivyId(authUserDto.privyId);
        if (user) {
            user = await this.usersRepository.updateUser(user.id);
        } else {
            user = await this.usersRepository.createUser(authUserDto, "user");
        }
        const jwtToken = await generateToken(user.id, authUserDto.email);

        return {
            user: user,
            token: jwtToken,
        };
    }
}