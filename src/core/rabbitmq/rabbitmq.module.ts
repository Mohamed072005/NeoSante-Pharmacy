import { Module, OnModuleInit } from "@nestjs/common";
import {ClientsModule, Transport} from "@nestjs/microservices";
import * as amqp from 'amqplib';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PHARMACY_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // RabbitMQ connection URL
          queue: 'pharmacy_service_queue', // Queue name
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQModule implements OnModuleInit {
  async onModuleInit() {
      try {
          const connection = await amqp.connect('amqp://localhost:5672');
          const channel = await connection.createChannel();
          await channel.assertQueue('pharmacy_service_queue', { durable: false });
          console.log('✅ pharmacy_service_queue declared successfully');
          await channel.close();
          await connection.close();
      } catch (error) {
          console.error('❌ Failed to declare pharmacy_service_queue:', error);
      }
  }
}