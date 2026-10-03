import { jest } from '@jest/globals';
import { GetDevicesUseCase, GetDeviceByIdUseCase, DeleteDeviceUseCase } from './device-management.use-cases';
import { UpdateDeviceUseCase } from './update-device.use-case';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Device, DeviceMode } from '../../domain/entities/device.entity';

describe('Device Management Use Cases', () => {
  let getDevicesUseCase: GetDevicesUseCase;
  let getDeviceByIdUseCase: GetDeviceByIdUseCase;
  let deleteDeviceUseCase: DeleteDeviceUseCase;
  let updateDeviceUseCase: UpdateDeviceUseCase;
  let mockDeviceRepository: any;

  beforeEach(() => {
    mockDeviceRepository = {
      findByOwnerId: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    getDevicesUseCase = new GetDevicesUseCase(mockDeviceRepository);
    getDeviceByIdUseCase = new GetDeviceByIdUseCase(mockDeviceRepository);
    deleteDeviceUseCase = new DeleteDeviceUseCase(mockDeviceRepository);
    updateDeviceUseCase = new UpdateDeviceUseCase(mockDeviceRepository);
  });

  const createDevice = (ownerId: string) => Device.create({
    id: 'dev-1', ownerId, name: 'Phone', mode: DeviceMode.PROTECTED,
    platform: 'Android', fcmToken: null, lastSeenAt: new Date(), createdAt: new Date(), isOnline: true });

  describe('GetDevicesUseCase', () => {
    it('should return devices', async () => {
      mockDeviceRepository.findByOwnerId.mockResolvedValue([createDevice('user-1')]);
      const res = await getDevicesUseCase.execute('user-1');
      expect(res.length).toBe(1);
    });
  });

  describe('GetDeviceByIdUseCase', () => {
    it('should throw NotFoundException', async () => {
      mockDeviceRepository.findById.mockResolvedValue(null);
      await expect(getDeviceByIdUseCase.execute('user-1', 'dev-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if wrong owner', async () => {
      mockDeviceRepository.findById.mockResolvedValue(createDevice('user-2'));
      await expect(getDeviceByIdUseCase.execute('user-1', 'dev-1')).rejects.toThrow(ForbiddenException);
    });

    it('should return device', async () => {
      mockDeviceRepository.findById.mockResolvedValue(createDevice('user-1'));
      const dev = await getDeviceByIdUseCase.execute('user-1', 'dev-1');
      expect(dev.id).toBe('dev-1');
    });
  });

  describe('DeleteDeviceUseCase', () => {
    it('should delete device', async () => {
      mockDeviceRepository.findById.mockResolvedValue(createDevice('user-1'));
      await deleteDeviceUseCase.execute('user-1', 'dev-1');
      expect(mockDeviceRepository.delete).toHaveBeenCalledWith('dev-1');
    });
  });

  describe('UpdateDeviceUseCase', () => {
    it('should update device', async () => {
      mockDeviceRepository.findById.mockResolvedValue(createDevice('user-1'));
      const res = await updateDeviceUseCase.execute('user-1', 'dev-1', { name: 'New Name', fcmToken: 'token' });
      expect(res.name).toBe('New Name');
      expect(res.fcmToken).toBe('token');
      expect(mockDeviceRepository.save).toHaveBeenCalled();
    });
  });
});


