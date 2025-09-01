import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    const config = {
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    };

    console.log('Configuring Cloudinary with:', {
      cloud_name: config.cloud_name,
      api_key: config.api_key,
      api_secret: config.api_secret ? 'SET' : 'NOT SET',
    });

    // Verificar que todas las credenciales estén presentes
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      console.error('Missing Cloudinary credentials!');
      throw new Error('Cloudinary credentials not configured properly');
    }

    cloudinary.config(config);

    // Probar la conexión
    this.testCloudinaryConnection();
  }

  private async testCloudinaryConnection() {
    try {
      console.log('Testing Cloudinary connection...');
      const pingResult = await cloudinary.api.ping();
      console.log('Cloudinary connection test:', pingResult);
    } catch (error) {
      console.error('Cloudinary connection test failed:', error);
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    console.log('=== CLOUDINARY SERVICE START ===');
    console.log(
      'CloudinaryService: Starting upload for file:',
      file.originalname,
    );

    if (!file || !file.buffer) {
      console.log('ERROR: File or file buffer is missing');
      throw new Error('File or file buffer is missing');
    }

    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferLength: file.buffer.length,
    });

    // Primero intentar Cloudinary, si falla usar almacenamiento local
    try {
      return await this.uploadToCloudinary(file);
    } catch (error) {
      console.log('Cloudinary failed, using local storage fallback...');
      return await this.uploadToLocal(file);
    }
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    console.log('Attempting Cloudinary upload...');

    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

    const uploadOptions = {
      folder: 'files',
      public_id: `${timestamp}_${safeName}`,
      resource_type: 'auto' as const,
      use_filename: true,
      unique_filename: false,
    };

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Cloudinary timeout'));
      }, 10000); // 10 segundos timeout más corto

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          clearTimeout(timeout);
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  private async uploadToLocal(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    console.log('=== LOCAL UPLOAD START ===');

    try {
      // Crear directorio de uploads si no existe
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('Created uploads directory:', uploadsDir);
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const fileExtension = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, fileExtension);
      const safeName = baseName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${safeName}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Guardar el archivo
      fs.writeFileSync(filePath, file.buffer);
      console.log('File saved locally:', filePath);

      // Construir URL local para servir el archivo
      const baseUrl =
        this.configService.get('FRONTEND_URL') || 'http://localhost:4000';
      const fileUrl = `${baseUrl}/files/${fileName}`;

      console.log('=== LOCAL UPLOAD SUCCESS ===');
      console.log('Local file URL:', fileUrl);

      // Retornar en formato compatible con Cloudinary
      return {
        secure_url: fileUrl,
        public_id: `local_${timestamp}_${safeName}`,
        version: 1,
        signature: 'local',
        width: 0,
        height: 0,
        format: fileExtension.replace('.', ''),
        resource_type: 'auto',
        created_at: new Date().toISOString(),
        tags: [],
        bytes: file.size,
        type: 'upload',
        etag: `local_${timestamp}`,
        placeholder: false,
        url: fileUrl,
        api_key: 'local',
        // Propiedades requeridas adicionales
        access_mode: 'public',
        original_filename: file.originalname,
        moderation: [],
        pages: 1,
        asset_id: `local_${timestamp}`,
        folder: 'files',
        access_control: [],
        context: {},
        metadata: {},
      } as unknown as UploadApiResponse;
    } catch (error) {
      console.error('=== LOCAL UPLOAD ERROR ===');
      console.error('Local upload error:', error);
      throw new Error(`Local upload failed: ${error.message}`);
    }
  }
}
