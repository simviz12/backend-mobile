import { Injectable } from '@nestjs/common';
import type { ICommandRepository } from '../../domain/repositories/command.repository.interface';
import { Command, CommandType, CommandStatus } from '../../domain/entities/command.entity';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { CommandType as PrismaCommandType, CommandStatus as PrismaCommandStatus } from '@prisma/client';

@Injectable()
export class PrismaCommandRepository implements ICommandRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(command: Command): Promise<void> {
    const payload = command.payload ? JSON.parse(JSON.stringify(command.payload)) : null;

    await this.prisma.command.upsert({
      where: { id: command.id },
      update: {
        status: command.status as PrismaCommandStatus,
        sentAt: command.sentAt,
      },
      create: {
        id: command.id,
        targetDeviceId: command.targetDeviceId,
        commandType: command.commandType as PrismaCommandType,
        payload,
        status: command.status as PrismaCommandStatus,
        createdAt: command.createdAt,
        sentAt: command.sentAt,
      },
    });
  }

  async findById(id: string): Promise<Command | null> {
    const raw = await this.prisma.command.findUnique({ where: { id } });
    if (!raw) return null;

    return Command.create({
      id: raw.id,
      targetDeviceId: raw.targetDeviceId,
      commandType: raw.commandType as CommandType,
      payload: raw.payload,
      status: raw.status as CommandStatus,
      createdAt: raw.createdAt,
      sentAt: raw.sentAt,
    });
  }
}
