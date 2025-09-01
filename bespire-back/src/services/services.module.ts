import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesResolver } from './services.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './schema/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
  ],
  providers: [ServicesResolver, ServicesService],
  exports: [ServicesService], // Export ServicesService so it can be used in other modules
})
export class ServicesModule {}
