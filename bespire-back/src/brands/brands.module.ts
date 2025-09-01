import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsResolver } from './brands.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './schema/brands.schema';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { PlansModule } from 'src/plans/plans.module';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    WorkspaceModule,
    PlansModule,
    FilesModule,
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
  ],
  providers: [BrandsResolver, BrandsService],
})
export class BrandsModule {}
