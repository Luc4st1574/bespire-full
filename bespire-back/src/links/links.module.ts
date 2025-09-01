import { Module } from '@nestjs/common';
import { LinksService } from './links.service';
import { LinksResolver } from './links.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Link, LinkSchema } from './schema/links.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Link.name, schema: LinkSchema }]),
  ],
  providers: [LinksResolver, LinksService],
  exports: [LinksService],
})
export class LinksModule {}
