import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadController } from './upload.controller';
import { FilesModule } from 'src/files/files.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [FilesModule, UsersModule],
  controllers: [UploadController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
