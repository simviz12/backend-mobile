import { Injectable } from '@nestjs/common';
import type { ICommandRepository } from '../../domain/repositories/command.repository.interface';
import { Command, CommandType, CommandStatus } from '../../domain/entities/command.entity';
import type { PaginatedResult } from '../../application/use-cases/get-commands.use-case';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
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
        updatedAt: command.updatedAt,
      },
      create: {
        id: command.id,
        targetDeviceId: command.targetDeviceId,
        commandType: command.commandType as PrismaCommandType,
        payload,
        status: command.status as PrismaCommandStatus,
        createdAt: command.createdAt,
        updatedAt: command.updatedAt,
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
      updatedAt: raw.updatedAt,
    });
  }

  async findByDeviceId(
    deviceId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<PaginatedResult<Command>> {
    const where: any = { targetDeviceId: deviceId };
    if (status) {
      where.status = status as PrismaCommandStatus;
    }

    const [rawList, total] = await Promise.all([
      this.prisma.command.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.command.count({ where }),
    ]);

    const data = rawList.map((raw) =>
      Command.create({
        id: raw.id,
        targetDeviceId: raw.targetDeviceId,
        commandType: raw.commandType as CommandType,
        payload: raw.payload,
        status: raw.status as CommandStatus,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      }),
    );

    return { data, total, page, limit };
  }
}
