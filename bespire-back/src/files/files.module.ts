import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesResolver, TagsResolver } from './files.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from './schema/files.schema';
import { Tag, TagSchema } from './schema/tag.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: File.name, schema: FileSchema },
      { name: Tag.name, schema: TagSchema },
    ]),
  ],
  providers: [FilesResolver, FilesService, TagsResolver],
  exports: [FilesService],
})
export class FilesModule {}
