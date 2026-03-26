import { EventPublisher } from 'src/types/events/interfaces/eventPublisher.interface';
import { logger } from 'src/utils/logger';

export class InMemoryPublisher implements EventPublisher {
  async publish(eventName: string, payload: any): Promise<void> {
    // Apenas loga por enquanto
    logger.info({
      type: 'EVENT_PUBLISHED',
      eventName,
      payload,
    });
  }
}
