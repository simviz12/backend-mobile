import { Global, Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { EVENT_PUBLISHER_PORT } from '../../application/ports/event-publisher.port';

@Global()
@Module({
  providers: [
    RealtimeGateway,
    {
      provide: EVENT_PUBLISHER_PORT,
      useExisting: RealtimeGateway,
    },
  ],
  exports: [EVENT_PUBLISHER_PORT],
})
export class WebsocketsModule {}
