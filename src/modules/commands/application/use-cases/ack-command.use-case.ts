import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { COMMAND_REPOSITORY } from '../../domain/repositories/command.repository.interface';
import type { ICommandRepository } from '../../domain/repositories/command.repository.interface';
import type { Command } from '../../domain/entities/command.entity';

@Injectable()
export class AckCommandUseCase {
  constructor(
    @Inject(COMMAND_REPOSITORY) private readonly commandRepository: ICommandRepository,
  ) {}

  async execute(commandId: string, ackStatus: 'DELIVERED' | 'EXECUTED' | 'FAILED'): Promise<Command> {
    const command = await this.commandRepository.findById(commandId);
    if (!command) throw new NotFoundException('Command not found');

    switch (ackStatus) {
      case 'DELIVERED':
        command.markAsDelivered();
        break;
      case 'EXECUTED':
        command.markAsExecuted();
        break;
      case 'FAILED':
        command.markAsFailed();
        break;
    }

    await this.commandRepository.save(command);
    return command;
  }
}
