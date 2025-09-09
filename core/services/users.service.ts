import { UsersRepository } from "@/core/repositories/users.repository";
import { UserRole } from "@/core/types/orders.types";
import { UsersFiltersDto } from "@/core/types/users.types";

export class UsersService {
  private usersRepository: UsersRepository;

  constructor() {
    this.usersRepository = new UsersRepository();
  }

  async getUsers(usersFiltersDto: UsersFiltersDto, userId: string, roleActiveNow: UserRole) {
    await this.validateUser(userId, "admin", roleActiveNow);
    const users = await this.usersRepository.getUsers(usersFiltersDto);
    return {
      users: users.users,
      pagination: {
        total: users.total,
        limit: usersFiltersDto.limit,
        offset: usersFiltersDto.offset,
        hasMore: usersFiltersDto.offset! + usersFiltersDto.limit! < users.total,
      },
    };
  }

  private async validateUser(userId: string, roleAllowed: UserRole, roleActiveNow: UserRole) {
    const isValid = await this.usersRepository.verifyUser(userId, roleAllowed);
    if (!isValid) {
      throw new Error(`${roleAllowed} role is required for user ${userId}`);
    }
    if (roleActiveNow !== roleAllowed) {
      throw new Error(`Role active now is ${roleActiveNow}, ${roleAllowed} role is required active now`);
    }
  }
}
