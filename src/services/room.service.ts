// src/services/room.service.ts
import { RoomRepository } from 'src/repositories/room.repository';
import { UnitRepository } from 'src/repositories/unit.repository';
import { sequelize } from 'src/database/sequelize';
import { AppError } from 'src/errors/AppError';
import { ErrorMessages } from 'src/errors/ErrorMessages';

interface CreateRoomDTO {
  name: string;
  unitId: string;
  capacity?: number;
}

export class RoomService {
  private roomRepository = new RoomRepository();
  private unitRepository = new UnitRepository();

  async createRoom(data: CreateRoomDTO) {
    const transaction = await sequelize.transaction();

    try {
      const unit = await this.unitRepository.findById(data.unitId);
      if (!unit) {
        throw new AppError(ErrorMessages.UNIT_NOT_FOUND);
      }

      const currentRoomCount = await this.roomRepository.countByUnitId(data.unitId);
      if (currentRoomCount >= unit.maxRooms) {
        throw new AppError(ErrorMessages.UNIT_MAX_ROOMS_REACHED);
      }

      const existing = await this.roomRepository.findByNameAndUnit(data.name, data.unitId);
      if (existing) {
        throw new AppError(ErrorMessages.ROOM_ALREADY_EXISTS_IN_UNIT);
      }

      const room = await this.roomRepository.create(
        {
          name: data.name,
          unitId: data.unitId,
          capacity: data.capacity ?? 3,
        },
        transaction,
      );

      await transaction.commit();

      return {
        status: 'CREATED',
        data: {
          id: room.id,
          name: room.name,
          unitId: room.unitId,
          capacity: room.capacity,
        },
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
