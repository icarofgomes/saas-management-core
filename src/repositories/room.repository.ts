// src/repositories/room.repository.ts
import { Room } from 'src/models/room.model';
import { Schedule } from 'src/models/schedule.model';
import { Transaction, Op } from 'sequelize';

export class RoomRepository {
  async countByUnitId(unitId: string): Promise<number> {
    return Room.count({ where: { unitId } });
  }

  async create(
    data: Partial<Room>,
    transaction?: Transaction,
  ): Promise<Room> {
    return Room.create(data, { transaction });
  }

  async findByNameAndUnit(name: string, unitId: string): Promise<Room | null> {
    return Room.findOne({
      where: { name, unitId },
    });
  }

  async findFreeRoom(
    unitId: string,
    startDateTime: Date,
    endDateTime: Date,
  ): Promise<Room | null> {
    // Pega os IDs dos rooms ocupados no intervalo na unidade específica
    const busySchedules = await Schedule.findAll({
      where: {
        startDateTime: { [Op.lt]: endDateTime },
        endDateTime: { [Op.gt]: startDateTime },
        unitId: unitId,
      },
      attributes: ['roomId'],
    });

    const busyRoomIds = busySchedules.map((s) => s.roomId);

    // Busca o primeiro room da unidade que não está ocupada
    return Room.findOne({
      where: {
        unitId: unitId,
        id: { [Op.notIn]: busyRoomIds.length ? busyRoomIds : [''] },
      },
    });
  }

  async findById(id: string): Promise<Room | null> {
    return Room.findByPk(id);
  }
}
