import { DynamicModule, Module } from '@nestjs/common';
import { KafkaProducer } from './kafka.producer';

export interface KafkaModuleOptions {
  clientId: string;
  brokers: string[];
}

@Module({})
export class KafkaModule {
  static forRoot(options: KafkaModuleOptions): DynamicModule {
    return {
      module: KafkaModule,
      global: true,
      providers: [
        { provide: 'KAFKA_OPTIONS', useValue: options },
        KafkaProducer,
      ],
      exports: [KafkaProducer],
    };
  }
}
