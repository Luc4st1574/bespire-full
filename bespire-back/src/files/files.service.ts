import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { File, FileDocument } from './schema/files.schema';
import { CreateFileInput } from './dto/create-file.input';
import { RequestAttachment } from 'src/requests/dto/request-detail.output';
import { Tag, TagDocument } from './schema/tag.schema';
import { CreateFolderInput } from './dto/inputs';
import { ListFilesInput } from './dto/filters';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
  ) {}

  /**
   * Mueve un archivo a la papelera (soft delete)
   */
  async moveFileToTrash(fileId: string, userId?: string): Promise<File | null> {
    const file = await this.fileModel.findById(fileId);
    if (!file) return null;
    file.deletedAt = new Date();
    await file.save();
    return file;
  }

  /**
   * Restaura un archivo desde la papelera
   */
  async restoreFile(fileId: string, userId?: string): Promise<File | null> {
    const file = await this.fileModel.findById(fileId);
    if (!file) return null;
    file.deletedAt = null;
    await file.save();
    return file;
  }

  // Actualiza solo el nombre de un archivo o carpeta
  async updateFileName(fileId: string, newName: string) {
    if (!newName.trim())
      throw new BadRequestException('El nombre no puede estar vacío');
    const updated = await this.fileModel.findByIdAndUpdate(
      fileId,
      { name: newName, updatedAt: new Date() },
      { new: true },
    );
    if (!updated) throw new BadRequestException('Archivo no encontrado');
    return updated;
  }

  async updateFileTags(fileId: string, tags: string[]) {
    // Solo actualiza el campo tags
    return this.fileModel.findByIdAndUpdate(fileId, { tags }, { new: true });
  }
  async create(
    createFileInput: CreateFileInput,
    uploadedBy?: string,
  ): Promise<File> {
    const toObjectId = (id?: string) =>
      id && Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : undefined;

    const workspaceObjId = toObjectId(createFileInput.workspaceId);
    const parentObjId =
      typeof createFileInput.parentId !== 'undefined'
        ? (toObjectId(createFileInput.parentId) ?? null)
        : null;

    const rawName = (createFileInput.name || '').trim();
    if (!rawName) throw new BadRequestException('Name required');

    // separar base y extension (ext incluye el punto si existe)
    const lastDot = rawName.lastIndexOf('.');
    let base = rawName;
    let ext = '';
    if (lastDot > 0) {
      base = rawName.slice(0, lastDot);
      ext = rawName.slice(lastDot); // incluye '.'
    }

    // generar nombre único comprobando existencia en mismo workspace + parent
    let candidate = rawName;
    let counter = 1;
    // busca documentos (incluye folders y files) que no estén borrados (deletedAt null)
    // ajustar según necesidad si quieres incluir eliminados en la comprobación
    while (
      await this.fileModel.findOne({
        name: candidate,
        workspaceId: workspaceObjId,
        parentId: parentObjId,
        deletedAt: null,
      })
    ) {
      candidate = `${base} (${counter})${ext}`;
      counter++;
    }

    const file = new this.fileModel({
      ...createFileInput,
      name: candidate,
      parentId: parentObjId,
      workspaceId: workspaceObjId,
      linkedToId: toObjectId(createFileInput.linkedToId),
      uploadedBy: toObjectId(uploadedBy),
      uploadedAt: new Date(),
    });

    // intento de guardado; en caso de carrera de concurrencia (11000) reintentar algunos veces
    try {
      return await file.save();
    } catch (e: any) {
      if (e.code === 11000) {
        // conflicto por concurrencia: seguir incrementando sufijo y reintentar
        let saved: File | null = null;
        let attempts = 0;
        while (attempts < 20 && !saved) {
          candidate = `${base} (${counter})${ext}`;
          file.name = candidate;
          try {
            saved = await file.save();
          } catch (err: any) {
            if (err.code === 11000) {
              counter++;
              attempts++;
              continue;
            }
            throw err;
          }
        }
        if (saved) return saved;
      }
      throw e;
    }
  }

  // Traer todos los files por linkedToId
  async findByLinkedToId(linkedToId: string): Promise<RequestAttachment[]> {
    const attachments = await this.fileModel
      .find({ linkedToId: new Types.ObjectId(linkedToId), deletedAt: null })
      .sort({ type: -1, name: 1 }) // Folders arriba, files abajo (opcional)
      .populate('uploadedBy')
      .lean();
    if (!attachments) {
      return [];
    }
    return attachments.map((att) => ({
      id: att._id.toString(),
      name: att.name,
      url: att.url,
      ext: att.ext,
      size: att.size,
      uploadedBy:
        `${(att.uploadedBy as any)?.firstName || ''} ${(att.uploadedBy as any)?.lastName || ''}`.trim(),
      uploadedAt: att.uploadedAt.toDateString(),
      // Puedes agregar más campos si quieres
    }));
  }

  async deleteFileById(fileId: string) {
    // Buscar hijos directos
    const parentIdObjectId = new Types.ObjectId(fileId);
    const children = await this.fileModel.find({ parentId: parentIdObjectId });
    for (const child of children) {
      await this.deleteFileById(child._id.toString());
    }
    // Borrar el archivo/carpeta principal
    const deleted = await this.fileModel.findByIdAndDelete(fileId);
    if (!deleted) {
      return false;
    }
    return true;
  }

  async updateFile(
    fileId: string,
    updateFileInput: CreateFileInput,
    uploadedBy?: string,
  ): Promise<File> {
    const toObjectId = (id?: string) =>
      id && Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : undefined;

    // Construir objeto de actualización incluyendo solo los campos que vienen en el input
    const update: any = { updatedAt: new Date() };

    // Copiar campos simples del input (name, tags, etc.)
    for (const key of Object.keys(updateFileInput || {})) {
      const value = (updateFileInput as any)[key];
      // Ignorar campos nulos/undefined aquí; los manejamos explícitamente abajo si es necesario
      if (typeof value !== 'undefined') {
        update[key] = value;
      }
    }

    // Campos que deben convertirse a ObjectId si vienen
    if (typeof updateFileInput.parentId !== 'undefined') {
      update.parentId = toObjectId(updateFileInput.parentId) ?? null;
    }
    if (typeof updateFileInput.workspaceId !== 'undefined') {
      const obj = toObjectId(updateFileInput.workspaceId);
      if (obj) update.workspaceId = obj;
    }
    if (typeof updateFileInput.linkedToId !== 'undefined') {
      update.linkedToId = toObjectId(updateFileInput.linkedToId) ?? null;
    }

    // uploadedBy viene como parámetro separado
    if (typeof uploadedBy !== 'undefined') {
      const u = toObjectId(uploadedBy);
      if (u) update.uploadedBy = u;
    }

    const updatedFile = await this.fileModel.findByIdAndUpdate(
      fileId,
      update,
      { new: true }, // Retorna el documento actualizado
    );

    if (!updatedFile) {
      throw new BadRequestException('File not found');
    }

    return updatedFile;
  }

  // Nuevo método para traer archivos y carpetas por workspaceId
  async findByWorkspaceId(
    workspaceId: string,
    parentId?: string,
  ): Promise<File[]> {
    const query: any = {
      workspaceId: new Types.ObjectId(workspaceId),
      deletedAt: null,
    };

    // Si se proporciona parentId, buscamos archivos/carpetas hijos
    // Si no se proporciona, buscamos los de la raíz (parentId: null)
    if (parentId) {
      query.parentId = new Types.ObjectId(parentId);
    } else {
      query.parentId = null;
    }

    const files = await this.fileModel
      .find(query)
      .sort({ type: -1, name: 1 }) // Carpetas primero, luego archivos por nombre
      .populate('uploadedBy', 'firstName lastName')
      .lean();

    return files.map((file) => ({
      ...file,
      _id: file._id.toString(),
    })) as any;
  }

  async createFolder(input: CreateFolderInput, userId?: string) {
    const { name, workspaceId, parentId, tags = [], access = ['All'] } = input;

    // validar parent si viene
    if (parentId) {
      const parent = await this.fileModel.findById(parentId);
      if (!parent) throw new BadRequestException('Parent folder not found');
      if (parent.type !== 'folder')
        throw new BadRequestException('Parent must be a folder');
    }

    const workspaceObjId = new Types.ObjectId(workspaceId);

    // upsert de tags (colección Tag)
    if (tags?.length) {
      await Promise.all(
        tags.map(async (t) => {
          const lower = t.toLowerCase();
          try {
            await this.tagModel.updateOne(
              {
                workspaceId: workspaceObjId,
                lowercaseName: lower,
              },
              {
                $setOnInsert: {
                  name: t,
                  lowercaseName: lower,
                  workspaceId: workspaceObjId,
                  createdBy: userId ? new Types.ObjectId(userId) : undefined,
                },
              },
              { upsert: true },
            );
          } catch (error) {
            // Si el tag ya existe, ignoramos el error de duplicado
            if (error.code !== 11000) {
              throw error;
            }
          }
        }),
      );
    }

    // crear carpeta
    const doc = new this.fileModel({
      name,
      type: 'folder',
      workspaceId: workspaceObjId,
      parentId: parentId ?? null,
      tags, // guardamos strings
      access, // ['All'] | ['Team'] | ['Private']
      uploadedBy: userId ? new Types.ObjectId(userId) : undefined,
      uploadedAt: new Date(),
    });

    try {
      return await doc.save();
    } catch (e) {
      // índice único: nombre duplicado en mismo parent/workspace
      if (e.code === 11000)
        throw new BadRequestException(
          'Folder name already exists in this location',
        );
      throw e;
    }
  }

  async listFiles(input: ListFilesInput) {
    console.log('listFiles input:', input);
    //en el input viene type opcional
    const { workspaceId, parentId, search, includeDeleted, type } = input;
    const workspaceObjectId = new Types.ObjectId(workspaceId);
    const parentObjectId = parentId ? new Types.ObjectId(parentId) : null;
    const q: any = { workspaceId: workspaceObjectId };
    if (type) {
      q.type = type;
    } else {
      q.type = { $in: ['file', 'folder'] };
    }

    // Si estamos en papelera, ignorar parentId para mostrar todos los eliminados
    if (includeDeleted === true) {
      q.deletedAt = { $ne: null };
      // No agregar parentId al query
    } else {
      q.deletedAt = null;
      // Solo filtrar por parentId si viene definido
      if (typeof parentId !== 'undefined') q.parentId = parentObjectId ?? null;
    }
    if (search?.trim())
      q.lowercaseName = { $regex: search.toLowerCase(), $options: 'i' };

    return this.fileModel.find(q).sort({ type: -1, lowercaseName: 1 }).lean();
  }

  async listTags(workspaceId: string, search?: string) {
    const workSpaceObjId = new Types.ObjectId(workspaceId);
    if (!Types.ObjectId.isValid(workSpaceObjId)) {
      throw new BadRequestException('Invalid workspaceId');
    }
    const q: any = { workspaceId: workSpaceObjId };
    if (search?.trim())
      q.lowercaseName = { $regex: search.toLowerCase(), $options: 'i' };
    return this.tagModel.find(q).sort({ lowercaseName: 1 }).lean();
  }

  async createTag(workspaceId: string, name: string, createdBy?: string) {
    if (!name.trim()) throw new BadRequestException('Tag name required');
    const lower = name.toLowerCase();
    const workspaceObjId = new Types.ObjectId(workspaceId);
    const existing = await this.tagModel.findOne({
      workspaceId: workspaceObjId,
      lowercaseName: lower,
    });
    if (existing) return existing;
    const tag = new this.tagModel({
      name,
      lowercaseName: lower,
      workspaceId: workspaceObjId,
      createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
      createdAt: new Date(),
    });
    return tag.save();
  }

  async findById(fileId: string) {
    if (!Types.ObjectId.isValid(fileId)) {
      return null;
    }
    return this.fileModel.findById(fileId).lean();
  }

  async getFolderPath(folderId: string): Promise<File[]> {
    if (!Types.ObjectId.isValid(folderId)) {
      return [];
    }

    const path: File[] = [];
    let currentId = folderId;

    while (currentId) {
      const folder = await this.fileModel.findById(currentId).lean();
      if (!folder || folder.type !== 'folder') {
        break;
      }

      path.unshift(folder as any); // Añadir al inicio para mantener el orden correcto
      currentId = folder.parentId?.toString() || null;
    }

    return path;
  }
}
