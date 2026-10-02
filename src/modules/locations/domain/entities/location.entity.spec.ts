import { Location } from './location.entity';

describe('Location Entity', () => {
  it('should create a valid location', () => {
    const loc = Location.create({
      id: 'loc-1', deviceId: 'dev-1', lat: 4.6097, lng: -74.0817,
      accuracy: 15, recordedAt: new Date(), createdAt: new Date(),
    });
    expect(loc.lat).toBe(4.6097);
    expect(loc.lng).toBe(-74.0817);
  });

  it('should reject lat > 90', () => {
    expect(() => Location.create({
      id: 'loc-1', deviceId: 'dev-1', lat: 91, lng: 0,
      recordedAt: new Date(), createdAt: new Date(),
    })).toThrow(/Latitude/);
  });

  it('should reject lng > 180', () => {
    expect(() => Location.create({
      id: 'loc-1', deviceId: 'dev-1', lat: 0, lng: 181,
      recordedAt: new Date(), createdAt: new Date(),
    })).toThrow(/Longitude/);
  });
});
