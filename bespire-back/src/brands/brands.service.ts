import { Injectable } from '@nestjs/common';
import { CreateBrandInput } from './dto/create-brand.input';
import { UpdateBrandInput } from './dto/update-brand.input';
import { InjectModel } from '@nestjs/mongoose';
import { Brand } from './schema/brands.schema';
import { Model, Types } from 'mongoose';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { PlansService } from 'src/plans/plans.service';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
    private readonly workspaceService: WorkspaceService,
    private readonly plansService: PlansService,
    private readonly filesService: FilesService,
  ) {}
  async create(createBrandInput: CreateBrandInput, userId) {
    //por ahora vendra el userid en el input pero luego debe venir en el request como token
    //  return this.planModel.create(createPlanInput);
    const workspace = await this.workspaceService.getWorkspaceById(
      createBrandInput.workspace,
    );
    if (!workspace) {
      throw new Error('Workspace not found');
    }
    const plan = await this.plansService.getPlanById(workspace.plan.toString());
    if (!plan) {
      throw new Error('Plan not found for the workspace');
    }
    const existingBrandsCount = await this.brandModel.countDocuments({
      workspace: workspace._id,
    });
    if (existingBrandsCount >= plan.brandsAllowed) {
      throw new Error(
        `You have reached the limit of ${plan.brandsAllowed} brands for this workspace's plan.`,
      );
    }

    // Crear slug a partir del name
    const slug = createBrandInput.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    const objCreated = {
      name: createBrandInput.name,
      slug,
      user: new Types.ObjectId(userId), // Asegurarse de que el user sea un ObjectId
      workspace: new Types.ObjectId(createBrandInput.workspace), // Asegurarse de que el workspace sea un ObjectId

      // Nuevos campos opcionales
      logos: (createBrandInput.logos || []).map((f: any) => {
        if (!f) return null;
        if (typeof f === 'string') {
          return { url: f, fileId: null };
        }
        return {
          url: f.url,
          fileId: new Types.ObjectId(f.fileId) || null, // Asegurarse de que fileId sea un ObjectId
        };
      }),
      fonts: (createBrandInput.fonts || [])
        .map((f: any) => {
          if (!f) return null;
          if (typeof f === 'string') {
            return {
              url: f,
              name: null,
              category: null,
              family: null,
              fileId: null,
            };
          }
          return {
            url: f.url,
            name: f.name || f.originalName || null,
            category: f.category || null,
            family: f.family || null, // Asegurarse de que family sea parte del input
            fileId: new Types.ObjectId(f.fileId) || null, // Asegurarse de que fileId sea un ObjectId
          };
        })
        .filter(Boolean),
      primaryColors: createBrandInput.primaryColors || [],
      secondaryColors: createBrandInput.secondaryColors || [],
      archetype: createBrandInput.archetype || null,
      description: createBrandInput.description || null,
      buyer: createBrandInput.buyer || null,
      tone: createBrandInput.tone || null,
      likes: createBrandInput.likes || [],
      dislikes: createBrandInput.dislikes || [],
    };

    // verificar que no exista un plan con el mismo slug
    const newBrand = await this.brandModel.create(objCreated).catch((error) => {
      if (error.code === 11000) {
        // Duplicate key error
        throw new Error(`Brand with slug ${slug} already exists.`);
      }
      throw error; // Rethrow other errors
    });

    //actualizar status de files de logos y fonts a 'linked'
    if (objCreated.logos && objCreated.logos.length > 0) {
      for (const logo of objCreated.logos) {
        if (logo.fileId) {
          await this.filesService.updateFile(logo.fileId.toString(), {
            status: 'linked',
            linkedToType: 'brand',
            linkedToId: newBrand._id.toString(),
          });
        }
      }
    }
    if (objCreated.fonts && objCreated.fonts.length > 0) {
      for (const font of objCreated.fonts) {
        if (font.fileId) {
          await this.filesService.updateFile(font.fileId.toString(), {
            status: 'linked',
            linkedToType: 'brand',
            linkedToId: newBrand._id.toString(),
          });
        }
      }
    }
  }

  async findByUser(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    return this.brandModel.find({ user: userObjectId }).lean();
  }

  async findByWorkspace(workspaceId: string) {
    const workspaceObjectId = new Types.ObjectId(workspaceId);
    return this.brandModel.find({ workspace: workspaceObjectId }).lean();
  }

  async findAll(workspace: string) {
    const workspaceObjectId = new Types.ObjectId(workspace);
    const brands = await this.brandModel
      .find({ workspace: workspaceObjectId })
      .populate('logos.fileId') // poblamos el documento File en logos.fileId
      .lean();

    // opcional: normalizar para front (adjuntar file metadata bajo `file`)
    return brands.map((b: any) => ({
      ...b,
      logos: (b.logos || []).map((l: any) => ({
        url: l.url,
        fileId: l.fileId?._id ? l.fileId._id.toString() : l.fileId,
        name: l.fileId?.name || null, // Asegúrate de que el nombre esté disponible
      })),
      fonts: (b.fonts || []).map((f: any) => ({
        url: f.url,
        name: f.name || null,
        category: f.category || null,
        family: f.family || null,
        fileId: f.fileId?._id ? f.fileId._id.toString() : f.fileId,
      })),
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} brand`;
  }

  async update(updateBrandInput: UpdateBrandInput) {
    console.log('updateBrandInput', updateBrandInput);
    const { id, ...data } = updateBrandInput as any;

    // Si se actualiza el nombre, recalcular slug
    if (data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^^\w-]+/g, '');
    }

    // Normalizar fonts en update si vienen objetos completos
    if (data.fonts && Array.isArray(data.fonts)) {
      data.fonts = data.fonts
        .map((f: any) => {
          if (!f) return null;
          if (typeof f === 'string')
            return { url: f, name: null, category: null };
          return {
            url: f.url,
            name: f.name || f.originalName || null,
            category: f.category || null,
          };
        })
        .filter(Boolean);
    }

    // Manejar workspace opcional: si viene, usarlo en el filtro; si no, actualizar por id
    const filter: any = { _id: new Types.ObjectId(id) };
    if (data.workspace) {
      filter.workspace = new Types.ObjectId(data.workspace);
      delete data.workspace; // no actualizar el workspace desde aquí
    }

    const updated = await this.brandModel.findOneAndUpdate(filter, data, {
      new: true,
    });
    if (!updated) throw new Error('Brand not found or not in this workspace');
    return updated;
  }

  async remove(brandId: string, workspaceId: string, userId: string) {
    // Primero, verifica que el usuario tenga permiso para eliminar la marca
    const userObjectId = new Types.ObjectId(userId);
    //buscar si el user es el owner del workspace
    const isOwner = this.workspaceService.isUserOwnerOfWorkspace(
      workspaceId,
      userObjectId,
    );
    if (!isOwner) {
      throw new Error('User does not have permission to delete this brand');
    }

    const brandObjectId = new Types.ObjectId(brandId);
    //soy el owner del workspace, puedo eliminar la brand
    return this.brandModel
      .deleteOne({
        _id: brandObjectId,
        workspace: new Types.ObjectId(workspaceId),
      })
      .then((result) => {
        if (result.deletedCount === 0) {
          throw new Error('Brand not found or not in this workspace');
        }
        return { message: 'Brand deleted successfully' };
      })
      .catch((error) => {
        throw new Error(`Error deleting brand: ${error.message}`);
      });
  }
}
