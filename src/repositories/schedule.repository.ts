import models from '../models';
import { Op, Transaction } from 'sequelize';

export class ScheduleRepository {
  async create(
    data: {
      roomId: string;
      unitId: string;
      startDateTime: Date;
      endDateTime?: Date;
    },
    transaction?: Transaction,
  ) {
    const endDateTime =
      data.endDateTime ??
      new Date(data.startDateTime.getTime() + 60 * 60 * 1000);

    return models.Schedule.create(
      {
        roomId: data.roomId,
        unitId: data.unitId,
        startDateTime: data.startDateTime,
        endDateTime,
      },
      { transaction },
    );
  }

  async findConflictingSchedules(startDateTime: Date, endDateTime: Date) {
    return models.Schedule.findAll({
      where: {
        startDateTime: { [Op.lt]: endDateTime },
        endDateTime: { [Op.gt]: startDateTime },
      },
    });
  }
}
