import { Injectable, Inject, ForbiddenException, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { COMMAND_REPOSITORY } from '../../domain/repositories/command.repository.interface';
import type { ICommandRepository } from '../../domain/repositories/command.repository.interface';
import { DEVICE_REPOSITORY } from '../../../devices/domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../../devices/domain/repositories/device.repository.interface';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { AUDIT_REPOSITORY } from '../../../audit/domain/repositories/audit.repository.interface';
import type { IAuditRepository } from '../../../audit/domain/repositories/audit.repository.interface';
import { PUSH_NOTIFICATION_PORT } from '../../../../shared/application/ports/push-notification.port';
import type { IPushNotificationPort } from '../../../../shared/application/ports/push-notification.port';
import { EVENT_PUBLISHER_PORT } from '../../../../shared/application/ports/event-publisher.port';
import type { IEventPublisherPort } from '../../../../shared/application/ports/event-publisher.port';
import { Command, CommandStatus, CommandType } from '../../domain/entities/command.entity';
import { CreateCommandDto } from '../dtos/create-command.dto';
import { DeviceMode } from '../../../devices/domain/entities/device.entity';
import { Password } from '../../../users/domain/value-objects/password.value-object';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';

@Injectable()
export class CreateCommandUseCase {
  private readonly logger = new Logger(CreateCommandUseCase.name);

  constructor(
    @Inject(COMMAND_REPOSITORY) private readonly commandRepository: ICommandRepository,
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: IAuditRepository,
    @Inject(PUSH_NOTIFICATION_PORT) private readonly pushPort: IPushNotificationPort,
    @Inject(EVENT_PUBLISHER_PORT) private readonly eventPublisher: IEventPublisherPort,
  ) {}

  async execute(userId: string, targetDeviceId: string, dto: CreateCommandDto): Promise<Command> {
    const device = await this.deviceRepository.findById(targetDeviceId);
    
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.ownerId !== userId) {
      throw new ForbiddenException('You do not own this device');
    }

    if (dto.commandType === CommandType.WIPE || dto.commandType === CommandType.LOCK) {
      if (!dto.sourceDeviceId) {
        throw new BadRequestException(`sourceDeviceId is required for ${dto.commandType} command`);
      }
      
      if (dto.sourceDeviceId !== 'SYSTEM') {
        const sourceDevice = await this.deviceRepository.findById(dto.sourceDeviceId);
        if (!sourceDevice || sourceDevice.ownerId !== userId || sourceDevice.mode !== DeviceMode.CONTROLLER) {
          throw new ForbiddenException(`Only a CONTROLLER device owned by you can issue a ${dto.commandType} command`);
        }
      }

      if (dto.commandType === CommandType.WIPE) {
        if (!dto.password) {
          throw new BadRequestException('Password confirmation is required for WIPE command');
        }

        const user = await this.userRepository.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        const isPasswordValid = await argon2.verify(user.password.value, dto.password);
        if (!isPasswordValid) {
          await this.auditRepository.log({
            userId,
            targetDeviceId,
            sourceDeviceId: dto.sourceDeviceId,
            action: 'WIPE',
            status: 'FAILED_AUTH',
          });
          throw new ForbiddenException('Invalid password');
        }
      }
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

    this.eventPublisher.publishToUser(userId, 'command.updated', {
      id: command.id,
      status: command.status,
    });

    if (dto.commandType === CommandType.WIPE || dto.commandType === CommandType.LOCK) {
      await this.auditRepository.log({
        userId,
        targetDeviceId,
        sourceDeviceId: dto.sourceDeviceId,
        action: dto.commandType,
        status: command.status,
      });
    }

    return command;
  }
}
