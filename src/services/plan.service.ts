import { PlanRepository } from 'src/repositories/plan.repository';

interface CreatePlanDTO {
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
}

export class PlanService {
  private planRepository = new PlanRepository();

  async createPlan(data: CreatePlanDTO) {
    const plan = await this.planRepository.create(data);
    return { status: 'CREATED', data: plan };
  }
}
