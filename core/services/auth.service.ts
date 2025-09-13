import { generateToken } from "../../utils/auth/jwt";
import { UsersMapper } from "../mappers/users.mapper";
import { AuthRepository } from "../repositories/auth.repository";
import { UsersRepository } from "../repositories/users.repository";
import { UserRole } from "../types/orders.types";
import { User } from "../types/users.types";

export class AuthService {
  private authRepository: AuthRepository;
  private usersRepository: UsersRepository;

  constructor() {
    this.authRepository = new AuthRepository();
    this.usersRepository = new UsersRepository();
  }

  async login(token: string) {
    const privyUser = await this.authRepository.verifyPrivyToken(token);
    let role: UserRole;
    let roleNames: UserRole[] = [];
    let roleIds: string[] = [];
    let howRoles: number = 1;
    let user = await this.usersRepository.findUserByPrivyId(privyUser.privyId!);
    if (user) {
      user = await this.usersRepository.updateUser(user.id!);
      role = await this.usersRepository.getRoleNameByRoleId(user.activeRoleId!);
      roleIds = await this.usersRepository.getRoleIdsByUserId(user.id!);
      if (roleIds.length > 1) {
        roleNames = await Promise.all(roleIds.map(roleId => this.usersRepository.getRoleNameByRoleId(roleId)));
        howRoles = roleIds.length;
      } else {
        roleNames = [role];
      }
    } else {
      role = "user";
      const roleId = await this.usersRepository.findRoleIdByName(role);
      user = await this.usersRepository.createUser(
        {
          ...privyUser,
          activeRoleId: roleId,
        },
        role
      );
    }
    const jwtToken = await generateToken(user.id!, user.privyId!, role);

    return {
      userResponse: UsersMapper.userToUserResponse(user, role, roleNames, roleIds, howRoles),
      token: jwtToken,
    };
  }
  async changeUserRole(userId: string, roleId: string) {
    const roleName = await this.usersRepository.getRoleNameByRoleId(roleId);
    const isValid = await this.usersRepository.verifyUser(userId, roleName);
    if (!isValid) {
      throw new Error("This user do not can access to this role");
    }
    const userChanged = await this.usersRepository.updateUser(userId, roleId);
    const jwtToken = await generateToken(userId, userChanged.privyId!, roleName);
    return {
      userResponse: UsersMapper.userToUserResponse(userChanged, roleName),
      token: jwtToken,
    };
  }

  async getProfile(userId: string): Promise<User | null> {
    const user = await this.usersRepository.findUserById(userId);
    return user;
  }
}
