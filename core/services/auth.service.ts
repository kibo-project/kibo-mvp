import { UsersMapper } from "../mappers/users.mapper";
import { AuthRepository } from "../repositories/auth.repository";
import { UsersRepository } from "../repositories/users.repository";
import { generateToken } from "@/utils/auth/jwt";

export class AuthService {
  private authRepository: AuthRepository;
  private usersRepository: UsersRepository;

  constructor() {
    this.authRepository = new AuthRepository();
    this.usersRepository = new UsersRepository();
  }

  async login(token: string) {
    const privyUser = await this.authRepository.verifyPrivyToken(token);
    const existsUser = await this.usersRepository.findUserIdByWallet(privyUser.walletAddress);
    if (existsUser) {
      await this.usersRepository.updateUser(existsUser);
    } else {
      await this.usersRepository.createUser({ ...privyUser });
    }
    const user = await this.usersRepository.getUserRolesByWallet(privyUser.walletAddress!);
    const jwtToken = await generateToken(user.id, user.roles![0].name);

    return {
      userResponse: user,
      token: jwtToken,
    };
  }

  async changeUserRole(userId: string, roleId: string) {
    const isValid = await this.usersRepository.verifyUser2(userId, roleId);
    if (!isValid) {
      throw new Error(`User ${userId} doesn't have role ${roleId}, checking if user exists`);
    }
    await this.usersRepository.updateUserRole(userId, roleId);
    const roleName = await this.usersRepository.getRoleNameByRoleId(roleId);
    const jwtToken = await generateToken(userId, roleName);
    const userChanged = await this.usersRepository.getUserRolesByUserId(userId);
    return {
      userResponse: userChanged,
      token: jwtToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      return null;
    }
    return UsersMapper.userToUserResponse(user);
  }
}
