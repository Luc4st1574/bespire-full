import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FilesService } from './files.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CreateFileInput } from './dto/create-file.input';
import { File } from './schema/files.schema';
import { RequestAttachment } from 'src/requests/dto/request-detail.output';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { PERMISSIONS } from 'src/auth/permissions.constants';
import { Permissions } from 'src/auth/permissions.decorator';
import { Tag } from './schema/tag.schema';
import { ListFilesInput } from './dto/filters';
import { CreateFolderInput } from './dto/inputs';

@Resolver()
export class FilesResolver {
  constructor(private readonly filesService: FilesService) {}

  //create file
  @Mutation(() => File)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.UPLOAD_FILES)
  async createFile(@Args('input') input: CreateFileInput, @Context('req') req) {
    const userId = req.user?.sub;
    return this.filesService.create(input, userId);
  }

  // Mover archivo a papelera (soft delete)
  @Mutation(() => File)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.DELETE_FILES)
  async moveFileToTrash(@Args('fileId') fileId: string, @Context('req') req) {
    const userId = req.user?.sub;
    return this.filesService.moveFileToTrash(fileId, userId);
  }

  // Restaurar archivo desde papelera
  @Mutation(() => File)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.MANAGE_FILES)
  async restoreFile(@Args('fileId') fileId: string, @Context('req') req) {
    const userId = req.user?.sub;
    return this.filesService.restoreFile(fileId, userId);
  }

  @Query(() => [RequestAttachment])
  async filesByLinkedToId(@Args('linkedToId') linkedToId: string) {
    return this.filesService.findByLinkedToId(linkedToId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.DELETE_FILES)
  async deleteFile(@Args('fileId') fileId: string, @Context('req') req) {
    const userId = req.user?.sub;
    return this.filesService.deleteFileById(fileId);
  }

  @Mutation(() => File)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.MANAGE_FILES)
  async createFolder(
    @Args('input') input: CreateFolderInput,
    @Context('req') req,
  ) {
    const userId = req.user?.sub;
    return this.filesService.createFolder(input, userId);
  }

  @Query(() => [File])
  async listFiles(@Args('input') input: ListFilesInput) {
    return this.filesService.listFiles(input);
  }

  @Query(() => File, { nullable: true })
  async getFileById(@Args('fileId') fileId: string) {
    return this.filesService.findById(fileId);
  }

  @Mutation(() => File)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.MANAGE_FILES)
  async updateFile(
    @Args('fileId') fileId: string,
    @Args('input') input: CreateFileInput,
    @Context('req') req,
  ) {
    const userId = req.user?.sub;
    return this.filesService.updateFile(fileId, input, userId);
  }

  @Query(() => [File])
  async getFolderPath(@Args('folderId') folderId: string) {
    return this.filesService.getFolderPath(folderId);
  }
}

@Resolver(() => Tag)
export class TagsResolver {
  constructor(private readonly filesService: FilesService) {}

  @Query(() => [Tag])
  async listTags(
    @Args('workspaceId') workspaceId: string,
    @Args('search', { nullable: true }) search?: string,
  ) {
    return this.filesService.listTags(workspaceId, search);
  }

  @Mutation(() => Tag)
  async createTag(
    @Args('workspaceId') workspaceId: string,
    @Args('name') name: string,
    @Args('createdBy', { nullable: true }) createdBy?: string,
  ) {
    return this.filesService.createTag(workspaceId, name, createdBy);
  }

  @Mutation(() => File)
  async updateFileTags(
    @Args('fileId') fileId: string,
    @Args({ name: 'tags', type: () => [String] }) tags: string[],
  ) {
    return this.filesService.updateFileTags(fileId, tags);
  }

  @Mutation(() => File)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.MANAGE_FILES)
  async updateFileName(
    @Args('fileId') fileId: string,
    @Args('newName') newName: string,
    @Context('req') req,
  ) {
    // Si quieres puedes usar userId para auditoría
    // const userId = req.user?.sub;
    return this.filesService.updateFileName(fileId, newName);
  }
}
