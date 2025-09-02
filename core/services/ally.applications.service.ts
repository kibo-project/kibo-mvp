import { AllyApplicationsRepository } from "../repositories/ally.applications.repository";
import { AllyApplicationDto, AllyApplicationRequest, applicationStatus } from "@/core/types/ally.applications.types";

export class AllyApplicationsService {
  private allyApplicationsRepository: AllyApplicationsRepository;
  constructor() {
    this.allyApplicationsRepository = new AllyApplicationsRepository();
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
}
