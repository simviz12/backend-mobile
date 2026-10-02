import { Injectable, Inject, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { COMMAND_REPOSITORY } from '../../domain/repositories/command.repository.interface';
import type { ICommandRepository } from '../../domain/repositories/command.repository.interface';
import { DEVICE_REPOSITORY } from '../../../devices/domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../../devices/domain/repositories/device.repository.interface';
import { PUSH_NOTIFICATION_PORT } from '../../../../shared/application/ports/push-notification.port';
import type { IPushNotificationPort } from '../../../../shared/application/ports/push-notification.port';
import { Command, CommandStatus } from '../../domain/entities/command.entity';
import { CreateCommandDto } from '../dtos/create-command.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateCommandUseCase {
  private readonly logger = new Logger(CreateCommandUseCase.name);

  constructor(
    @Inject(COMMAND_REPOSITORY) private readonly commandRepository: ICommandRepository,
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
    @Inject(PUSH_NOTIFICATION_PORT) private readonly pushPort: IPushNotificationPort,
  ) {}

  async execute(userId: string, targetDeviceId: string, dto: CreateCommandDto): Promise<Command> {
    const device = await this.deviceRepository.findById(targetDeviceId);
    
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.ownerId !== userId) {
      throw new ForbiddenException('You do not own this device');
    }

    const command = Command.create({
      id: uuidv4(),
      targetDeviceId,
      commandType: dto.commandType,
      payload: dto.payload,
      status: CommandStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.commandRepository.save(command);

    if (device.fcmToken) {
      const success = await this.pushPort.send({
        token: device.fcmToken,
        priority: 'high',
        ttl: 3600, // 1 hour
        data: {
          commandId: command.id,
          commandType: command.commandType,
          payload: command.payload ? JSON.stringify(command.payload) : '',
        }
      });

      if (success) {
        command.markAsSent();
        await this.commandRepository.save(command);
      } else {
        command.markAsFailed();
        await this.commandRepository.save(command);
      }
    } else {
      this.logger.warn(`Device ${device.id} has no fcmToken. Command ${command.id} remains PENDING.`);
    }

    return command;
  }
}
