import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { COMMAND_REPOSITORY } from '../../domain/repositories/command.repository.interface';
import type { ICommandRepository } from '../../domain/repositories/command.repository.interface';
import { DEVICE_REPOSITORY } from '../../../devices/domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../../devices/domain/repositories/device.repository.interface';
import { EVENT_PUBLISHER_PORT } from '../../../../shared/application/ports/event-publisher.port';
import type { IEventPublisherPort } from '../../../../shared/application/ports/event-publisher.port';
import type { Command } from '../../domain/entities/command.entity';

@Injectable()
export class AckCommandUseCase {
  constructor(
    @Inject(COMMAND_REPOSITORY) private readonly commandRepository: ICommandRepository,
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
    @Inject(EVENT_PUBLISHER_PORT) private readonly eventPublisher: IEventPublisherPort,
  ) {}

  async execute(commandId: string, ackStatus: 'DELIVERED' | 'EXECUTED' | 'FAILED'): Promise<Command> {
    const command = await this.commandRepository.findById(commandId);
    if (!command) throw new NotFoundException('Command not found');

    const device = await this.deviceRepository.findById(command.targetDeviceId);

    let changed = false;
    switch (ackStatus) {
      case 'DELIVERED':
        changed = command.markAsDelivered();
        break;
      case 'EXECUTED':
        changed = command.markAsExecuted();
        break;
      case 'FAILED':
        changed = command.markAsFailed();
        break;
    }

    if (changed) {
      await this.commandRepository.save(command);

      if (device) {
        this.eventPublisher.publishToUser(device.ownerId, 'command.updated', {
          id: command.id,
          status: command.status,
        });
      }
    }

    return command;
  }
}
