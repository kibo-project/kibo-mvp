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
    return await this.allyApplicationsRepository.createApplication(allyApplicationDto);
  }
  async getApplications(applicationFilers: ApplicationsFiltersRequest, userId: string, roleActiveNow: UserRole) {
    this.validateUser(userId, "admin", roleActiveNow);
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
  async approveApplication(userId: string, roleActiveNow: UserRole, applicationId: string) {
    this.validateUser(userId, "admin", roleActiveNow);
    const existsApplication = await this.allyApplicationsRepository.findById(applicationId);
    if (!existsApplication) {
      throw new Error(`Application does not exist`);
    }
    const application = await this.allyApplicationsRepository.approveApplication(applicationId, userId);
    if (application) {
      const roleId = await this.usersRepository.findRoleIdByName("ally");
      await this.usersRepository.createUserRole(application.userId, roleId);
    }
    return application;
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
