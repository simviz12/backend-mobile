import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { COMMAND_REPOSITORY } from '../../domain/repositories/command.repository.interface';
import type { ICommandRepository } from '../../domain/repositories/command.repository.interface';
import { DEVICE_REPOSITORY } from '../../../devices/domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../../devices/domain/repositories/device.repository.interface';
import type { Command } from '../../domain/entities/command.entity';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class GetCommandsUseCase {
  constructor(
    @Inject(COMMAND_REPOSITORY) private readonly commandRepository: ICommandRepository,
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
  ) {}

  async execute(
    userId: string,
    deviceId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
  ): Promise<PaginatedResult<Command>> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw new NotFoundException('Device not found');
    if (device.ownerId !== userId) throw new ForbiddenException('Access denied');

    return this.commandRepository.findByDeviceId(deviceId, page, limit, status);
  }
}
