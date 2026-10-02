import { jest } from '@jest/globals';
import { LinkDeviceUseCase } from './link-device.use-case';
import { DeviceMode } from '../../domain/entities/device.entity';

describe('LinkDeviceUseCase', () => {
  let useCase: LinkDeviceUseCase;
  let mockDeviceRepository: any;

  beforeEach(() => {
    mockDeviceRepository = {
      save: jest.fn(),
    };
    useCase = new LinkDeviceUseCase(mockDeviceRepository);
  });

  it('should create and link a new device', async () => {
    const ownerId = 'user-1';
    const dto = {
      name: 'Test Device',
      mode: DeviceMode.PROTECTED,
      platform: 'Android',
      fcmToken: 'token123',
    };

    const device = await useCase.execute(ownerId, dto);

    expect(device.id).toBeDefined();
    expect(device.ownerId).toBe(ownerId);
    expect(device.name).toBe(dto.name);
    expect(device.mode).toBe(dto.mode);
    expect(device.fcmToken).toBe(dto.fcmToken);
    expect(mockDeviceRepository.save).toHaveBeenCalledWith(device);
  });
});
