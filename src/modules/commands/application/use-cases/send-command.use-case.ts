import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { COMMAND_REPOSITORY } from '../../domain/repositories/command.repository.interface';
import type { ICommandRepository } from '../../domain/repositories/command.repository.interface';
import { DEVICE_REPOSITORY } from '../../../devices/domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../../devices/domain/repositories/device.repository.interface';
import { Command, CommandStatus } from '../../domain/entities/command.entity';
import { CommandDto } from '../dtos/command.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SendCommandUseCase {
  constructor(
    @Inject(COMMAND_REPOSITORY) private readonly commandRepository: ICommandRepository,
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
  ) {}

  async execute(userId: string, dto: CommandDto): Promise<Command> {
    const device = await this.deviceRepository.findById(dto.targetDeviceId);
    
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.ownerId !== userId) {
      throw new ForbiddenException('You do not own this device');
    }

    const command = Command.create({
      id: uuidv4(),
      targetDeviceId: dto.targetDeviceId,
      commandType: dto.commandType,
      payload: dto.payload,
      status: CommandStatus.PENDING,
      createdAt: new Date(),
    });

    await this.commandRepository.save(command);

    // Later here we will integrate Firebase Cloud Messaging (FCM) to actually send it.

    return command;
  }
}
