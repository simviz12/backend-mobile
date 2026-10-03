import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DEVICE_REPOSITORY } from '../../../devices/domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../../devices/domain/repositories/device.repository.interface';
import { THEFT_MODE_LOG_REPOSITORY } from '../../domain/repositories/theft-mode-log.repository.interface';
import type { ITheftModeLogRepository } from '../../domain/repositories/theft-mode-log.repository.interface';
import { CreateCommandUseCase } from '../../../commands/application/use-cases/create-command.use-case';
import { CommandType } from '../../../commands/domain/entities/command.entity';

@Injectable()
export class ActivateTheftModeUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
    @Inject(THEFT_MODE_LOG_REPOSITORY) private readonly theftLogRepository: ITheftModeLogRepository,
    private readonly createCommandUseCase: CreateCommandUseCase,
  ) {}

  async execute(userId: string, deviceId: string): Promise<void> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw new NotFoundException('Device not found');
    if (device.ownerId !== userId) throw new ForbiddenException('Access denied');

    if (device.isTheftModeActive) {
      throw new BadRequestException('Theft mode is already active');
    }

    device.activateTheftMode();
    await this.deviceRepository.save(device);

    await this.theftLogRepository.logAction(deviceId, 'ACTIVATED', 'User requested theft mode');

    // Orchestrate existing commands
    try {
      await this.createCommandUseCase.execute(userId, deviceId, { commandType: CommandType.LOCK, sourceDeviceId: 'SYSTEM' });
      await this.createCommandUseCase.execute(userId, deviceId, { commandType: CommandType.RING });
      await this.createCommandUseCase.execute(userId, deviceId, { 
        commandType: CommandType.MESSAGE, 
        payload: { text: 'This device is reported as stolen.' } 
      });
      await this.createCommandUseCase.execute(userId, deviceId, { commandType: CommandType.LOCATE });
      // The THEFT_MODE command can also be sent to signal the app to keep tracking
      await this.createCommandUseCase.execute(userId, deviceId, { commandType: CommandType.THEFT_MODE });
    } catch (error) {
      // If one fails, we might still want the others to go through or just log it
      console.error('Failed to orchestrate some commands during theft mode', error);
    }
  }
}
