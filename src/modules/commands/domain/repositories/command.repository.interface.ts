import type { Command } from '../entities/command.entity';
import type { PaginatedResult } from '../../application/use-cases/get-commands.use-case';

export const COMMAND_REPOSITORY = Symbol('COMMAND_REPOSITORY');

export interface ICommandRepository {
  save(command: Command): Promise<void>;
  findById(id: string): Promise<Command | null>;
  findByDeviceId(deviceId: string, page: number, limit: number, status?: string): Promise<PaginatedResult<Command>>;
}
