import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DEVICE_REPOSITORY } from '../../../devices/domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../../devices/domain/repositories/device.repository.interface';
import { THEFT_MODE_LOG_REPOSITORY } from '../../domain/repositories/theft-mode-log.repository.interface';
import type { ITheftModeLogRepository } from '../../domain/repositories/theft-mode-log.repository.interface';
import { CreateCommandUseCase } from '../../../commands/application/use-cases/create-command.use-case';
import { CommandType } from '../../../commands/domain/entities/command.entity';

@Injectable()
export class DeactivateTheftModeUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
    @Inject(THEFT_MODE_LOG_REPOSITORY) private readonly theftLogRepository: ITheftModeLogRepository,
    private readonly createCommandUseCase: CreateCommandUseCase,
  ) {}

  async execute(userId: string, deviceId: string): Promise<void> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw new NotFoundException('Device not found');
    if (device.ownerId !== userId) throw new ForbiddenException('Access denied');

    if (!device.isTheftModeActive) {
      throw new BadRequestException('Theft mode is not active');
    }

    device.deactivateTheftMode();
    await this.deviceRepository.save(device);

    await this.theftLogRepository.logAction(deviceId, 'DEACTIVATED', 'User disabled theft mode');
  }
}
