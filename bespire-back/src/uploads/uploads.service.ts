import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import { FilesService } from 'src/files/files.service';
import { UsersService } from 'src/users/users.service';

export interface UploadResponse {
  fileId: string;
  ok: boolean;
  name?: string;
  originalName?: string;
  key: string;
  size_bytes: number;
  content_type: string;
  url: string;
  hash_sha256: string;
  created_at: string;
}

@Injectable()
export class UploadsService {
  constructor(
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
  ) {}

  private readonly baseURL =
    process.env.FILES_API_BASE_URL?.replace(/\/+$/, '') ||
    'http://127.0.0.1:8090';
  private readonly apiKey = process.env.FILES_API_KEY || '';
  private readonly defaultProject =
    process.env.FILES_DEFAULT_PROJECT || 'default';

  async uploadImage(
    file: Express.Multer.File,
    user_id: string,
    fileData: any,
    project?: string,
  ): Promise<UploadResponse> {
    console.log('=== UPLOADS SERVICE START ===');
    console.log('UploadsService: Starting upload for file:', file.originalname);

    if (!file) {
      console.log('ERROR: No file provided');
      throw new BadRequestException('No file provided');
    }

    if (!file.buffer?.length) {
      console.log('ERROR: Empty file buffer');
      throw new BadRequestException(
        'Empty file buffer. Ensure Multer uses memory storage.',
      );
    }

    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferLength: file.buffer.length,
    });

    console.log('Upload configuration:', {
      baseURL: this.baseURL,
      apiKey: this.apiKey ? 'SET' : 'NOT SET',
      project: project || this.defaultProject,
    });

    const form = new FormData();
    form.append('project', project || this.defaultProject);
    form.append('file', file.buffer, {
      filename: file.originalname || 'upload.bin',
      contentType: file.mimetype || 'application/octet-stream',
      knownLength: file.size,
    });

    console.log(
      'FormData prepared, making request to:',
      `${this.baseURL}/v1/upload`,
    );

    try {
      const res = await axios.post<UploadResponse>(
        `${this.baseURL}/v1/upload`,
        form,
        {
          headers: { 'X-API-Key': this.apiKey, ...form.getHeaders() },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: 60_000,
        },
      );

      console.log('Upload response received:', {
        status: res.status,
        ok: res.data?.ok,
        url: res.data?.url,
        key: res.data?.key,
      });

      if (!res.data?.ok) {
        console.log('ERROR: Upload service responded without ok=true');
        throw new Error('Upload service responded without ok=true');
      }

      console.log('=== UPLOADS SERVICE SUCCESS ===');
      console.log('Upload successful:', {
        key: res.data.key,
        size_bytes: res.data.size_bytes,
        content_type: res.data.content_type,
        url: res.data.url,
        hash_sha256: res.data.hash_sha256,
        created_at: res.data.created_at,
      });
      //buscar el user para obtener el workspaceId
      const user = await this.usersService.findById(user_id);
      if (!user || !user.workspaceSelected) {
        console.log('ERROR: User not found or missing workspaceId');
        throw new BadRequestException('User not found or missing workspaceId');
      }
      // Aquí podrías crear el File en tu base de datos usando FilesService
      const fileDb = await this.filesService.create(
        {
          name: file.originalname,
          type: 'file',
          url: res.data.url,
          ext: file.mimetype.split('/')[1],
          size: res.data.size_bytes,
          workspaceId: user.workspaceSelected.toString(),
          status: fileData?.status || 'draft',
          parentId: fileData?.parentId || null,
          tags: fileData?.tags || [],
          access: fileData?.access || ['All'],
          linkedToId: fileData?.linkedToId || null,
          linkedToType: fileData?.linkedToType || null,
        },
        user_id,
      );
      console.log(
        'File created in database with workspaceId:',
        user.workspaceSelected.toString(),
      );
      // Retornar la respuesta del upload
      //añadir el id del file en la respuesta
      res.data.fileId = fileDb._id.toString(); // Añadir el ID del archivo creado
      res.data.name = fileDb.name; // Añadir el nombre del archivo creado
      res.data.originalName = file.originalname; // Añadir el nombre original del archivo
      // Retornar el objeto completo
      return res.data;
    } catch (err: any) {
      console.error('=== UPLOADS SERVICE ERROR ===');
      console.error('Upload error details:', {
        message: err?.message,
        response_status: err?.response?.status,
        response_data: err?.response?.data,
        config_url: err?.config?.url,
        config_method: err?.config?.method,
      });

      const msg =
        err?.response?.data?.detail || err?.message || 'Unknown upload error';
      throw new InternalServerErrorException(`Upload failed: ${msg}`);
    }
  }

  async deleteByKey(key: string): Promise<{ ok: boolean; deleted: string }> {
    try {
      const res = await axios.delete<{ ok: boolean; deleted: string }>(
        `${this.baseURL}/v1/delete`,
        {
          params: { key },
          headers: { 'X-API-Key': this.apiKey },
          timeout: 20_000,
        },
      );
      return res.data;
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || err?.message || 'Unknown delete error';
      throw new InternalServerErrorException(`Delete failed: ${msg}`);
    }
  }
}
