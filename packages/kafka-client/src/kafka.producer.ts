import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { KafkaEventEnvelope } from '@psl-one/event-schemas';
import { KafkaModuleOptions } from './kafka.module';

@Injectable()
export class KafkaProducer implements OnModuleInit {
  private producer!: Producer;

  constructor(@Inject('KAFKA_OPTIONS') private readonly options: KafkaModuleOptions) {}

  async onModuleInit(): Promise<void> {
    const kafka = new Kafka({ clientId: this.options.clientId, brokers: this.options.brokers });
    this.producer = kafka.producer();
    await this.producer.connect();
  }

  async publish<T>(topic: string, event: KafkaEventEnvelope<T>): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          key: event.correlationId,
          value: JSON.stringify(event),
          headers: { eventType: event.eventType, version: event.version },
        },
      ],
    });
  }
}
