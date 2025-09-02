import { AllyApplicationsRepository } from "../repositories/ally.applications.repository";
import { UsersRepository } from "../repositories/users.repository";
import {
  AllyApplicationDto,
  AllyApplicationRequest,
  ApplicationsFiltersRequest,
  applicationStatus,
} from "@/core/types/ally.applications.types";
import { UserRole } from "@/core/types/orders.types";

export class AllyApplicationsService {
  private allyApplicationsRepository: AllyApplicationsRepository;
  private usersRepository: UsersRepository;

  constructor() {
    this.allyApplicationsRepository = new AllyApplicationsRepository();
    this.usersRepository = new UsersRepository();
  }

  async applicationToAlly(userId: string, allyApplicationRequest: AllyApplicationRequest) {
    const isOne = await this.allyApplicationsRepository.verifyOneApplication(userId);
    if (!isOne) {
      throw new Error(`This Application to ally already exists`);
    }
    const allyApplicationDto: AllyApplicationDto = {
      userId,
      fullName: allyApplicationRequest.fullName,
      phone: allyApplicationRequest.phone,
      address: allyApplicationRequest.address,
      status: applicationStatus.PENDING,
    };
    return this.allyApplicationsRepository.createApplication(allyApplicationDto);
  }
  async getApplications(applicationFilers: ApplicationsFiltersRequest, userId: string, roleActiveNow: UserRole) {
    const isAdmin = await this.usersRepository.verifyUser(userId, "admin");
    if (!isAdmin) {
      throw new Error(`Admin role is required ${userId}`);
    }
    if (roleActiveNow != "admin") {
      throw new Error(`Role active now is ${userId} ,admin role active now is required`);
    }
    const applications = await this.allyApplicationsRepository.getApplications(applicationFilers);
    return {
      applications: applications.applications,
      pagination: {
        total: applications.total,
        limit: applicationFilers.limit,
        offset: applicationFilers.offset,
        hasMore: applicationFilers.offset! + applicationFilers.limit! < applications.total,
      },
    };
  }
}
