import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesService } from './companies.service';
import { CompaniesResolver } from './companies.resolver';
import { Company, CompanySchema } from './schema/company.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
  ],
  providers: [CompaniesResolver, CompaniesService],
  exports: [CompaniesService], // Exportamos el servicio para que pueda ser usado en otros módulos
})
export class CompaniesModule {}
