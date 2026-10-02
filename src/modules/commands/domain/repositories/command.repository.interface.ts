import type { Command } from '../entities/command.entity';

export const COMMAND_REPOSITORY = Symbol('COMMAND_REPOSITORY');

export interface ICommandRepository {
  save(command: Command): Promise<void>;
  findById(id: string): Promise<Command | null>;
}
