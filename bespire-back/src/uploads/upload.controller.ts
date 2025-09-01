import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';

@Controller('upload')
export class UploadController {
  constructor(private uploadsService: UploadsService) {}

  @Post('image')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // importante para tener file.buffer
      limits: { fileSize: 50 * 1024 * 1024 }, // alinea con Nginx/API
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    console.log('=== UPLOADS CONTROLLER START ===');
    console.log('Request received at /upload/image');

    const userId = req.user?.sub;
    console.log('Authenticated userId:', userId);

    // Recuperar campos enviados en el FormData (llegan en req.body)
    const {
      parentId,
      tags,
      access,
      workspaceId,
      linkedToType,
      linkedToId,
      name,
      status,
    } = req.body || {};

    // tags y access pueden venir serializados como JSON desde el frontend
    let parsedTags: string[] | undefined = undefined;
    let parsedAccess: string[] | undefined = undefined;
    try {
      if (typeof tags === 'string' && tags.length)
        parsedTags = JSON.parse(tags);
    } catch (e) {
      console.warn('Could not parse tags from FormData', e);
    }
    try {
      if (typeof access === 'string' && access.length)
        parsedAccess = JSON.parse(access);
    } catch (e) {
      console.warn('Could not parse access from FormData', e);
    }

    console.log('FormData fields:', {
      parentId,
      workspaceId,
      linkedToType,
      linkedToId,
      name,
      tags: parsedTags,
      access: parsedAccess,
    });

    if (!file) {
      console.log('ERROR: No file uploaded');
      throw new BadRequestException('No file uploaded');
    }

    console.log('File received:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer,
      bufferLength: file.buffer?.length,
    });

    try {
      console.log('Starting upload with UploadsService...');
      // Pasamos metadata adicional al servicio: parentId, workspaceId, tags, access, linkedTo...
      const result = await this.uploadsService.uploadImage(file, userId, {
        parentId,
        workspaceId,
        tags: parsedTags,
        access: parsedAccess,
        linkedToType,
        linkedToId,
        status,
        name: name || file.originalname,
      });

      //bueno necesito crear el file, asi que en el servicio debo crear el File pasandole los datos del result
      //en ese servicio debo usar otros servicios como el del user para obtener el workspaceId.
      //y debo retornar el File creado o al menos el id del file creado y usarlo para luego actualizar el file
      console.log('Upload successful:', {
        url: result.url,
        key: result.key,
        size: result.size_bytes,
        contentType: result.content_type,
        hash: result.hash_sha256,
      });

      console.log('=== UPLOADS CONTROLLER SUCCESS ===');

      return {
        url: result.url,
        key: result.key,
        size: result.size_bytes,
        contentType: result.content_type,
        hash: result.hash_sha256,
        createdAt: result.created_at,
        fileId: result.fileId, // Asegúrate de que el servicio retorne este campo
        name: result.name, // Asegúrate de que el servicio retorne este campo
        originalName: result.originalName, // Asegúrate de que el servicio retorne
      };
    } catch (error) {
      console.error('=== UPLOADS CONTROLLER ERROR ===');
      console.error('Upload error details:', {
        message: error.message,
        stack: error.stack,
        error: error,
      });

      throw new BadRequestException('File upload failed: ' + error.message);
    }
  }
}
