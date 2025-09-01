import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequestsService } from './requests.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CreateRequestInput } from './dto/create-request.input';
import {
  RequestCreateResponse,
  RequestResponseForList,
} from './entities/request.entity';
import { UpdateAssigneesInput } from './dto/update-assignees.input';
import {
  RequestComment,
  RequestDetail,
  RequestSubtask,
} from './dto/request-detail.output';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { Permissions } from 'src/auth/permissions.decorator';
import { PERMISSIONS } from 'src/auth/permissions.constants';
import { UpdateRequestFieldsInput } from './dto/update-request-fields.input';
@Resolver()
export class RequestsResolver {
  constructor(private readonly requestsService: RequestsService) {}

  @Mutation(() => RequestCreateResponse)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.CREATE_REQUESTS)
  async createRequest(
    @Args('input') input: CreateRequestInput,
    @Context('req') req,
  ) {
    return this.requestsService.createRequest(input, req.user.sub);
  }

  @Query(() => [RequestResponseForList], { name: 'requestsListForInternal' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.VIEW_INTERNAL_REQUESTS)
  async requestsListForInternal(
    @Context('req') req: any,
  ): Promise<RequestResponseForList[]> {
    const userId = req.user.sub;
    const role = req.user.role; // Obtener el rol del usuario
    const requests = await this.requestsService.findRequestsForInternal(
      userId,
      role,
    );
    return requests.map(
      (r): RequestResponseForList => ({
        id: r._id.toString(),
        title: r.title,
        createdAt: r.createdAt.toISOString(),
        category: r.service?.type ?? '',
        client: r.workspaceInfo?.companyName || r.workspaceInfo?.name || '', // Aquí traes el campo correcto
        dueDate: r.dueDate.toISOString(),
        parentRequest: r.parentRequest ? r.parentRequest.toString() : null,
        commentsCount: r.commentsCount,
        credits: r.credits,
        attachmentsCount: r.attachmentsCount,
        subtasksCount: r.subtasksCount,
        priority: r.priority,
        status: r.status,
        assignees: r.assignees.map((assignee) => ({
          id: assignee.userId,
          name: assignee.name,
          teamRole: assignee.teamRole ?? null, // Optional field
          avatarUrl: assignee.avatarUrl ?? null, // Optional field
        })),
      }),
    );
  }

  @Query(() => [RequestResponseForList], { name: 'getRequestList' })
  @UseGuards(GqlAuthGuard)
  async getRequestList(
    @Context('req') req: any,
  ): Promise<RequestResponseForList[]> {
    const userId = req.user.sub;
    const requests = await this.requestsService.findAllWithAssignees(userId);
    console.log('Requests found:', JSON.stringify(requests, null, 2));
    return requests.map(
      (r): RequestResponseForList => ({
        id: r._id.toString(),
        title: r.title,
        createdAt: r.createdAt.toISOString(),
        category: r.service?.type ?? '',
        dueDate: r.dueDate.toISOString(),
        parentRequest: r.parentRequest ? r.parentRequest.toString() : null,
        commentsCount: r.commentsCount,
        attachmentsCount: r.attachmentsCount,
        subtasksCount: r.subtasksCount,
        credits: r.credits,
        priority: r.priority,
        status: r.status,
        assignees: r.assignees.map((assignee) => ({
          id: assignee.userId,
          name: assignee.name,
          teamRole: assignee.teamRole ?? null, // Optional field
          avatarUrl: assignee.avatarUrl ?? null, // Optional field
        })),
      }),
    );
  }

  @Mutation(() => String, { name: 'updateRequestAssignees' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USER_ASSIGNMENTS)
  async updateRequestAssignees(
    @Args('input') input: UpdateAssigneesInput,
  ): Promise<string> {
    const { requestId, assignees } = input;
    return this.requestsService.updateAssignees(requestId, assignees);
  }

  /**
   * GraphQL Query para obtener el detalle completo de una solicitud.
   * Protegido por autenticación.
   * @param id - El ID de la solicitud a obtener.
   * @returns El objeto RequestDetailOutput con todos los datos.
   */
  @Query(() => RequestDetail, { name: 'requestDetail' })
  @UseGuards(GqlAuthGuard)
  getRequestDetail(
    @Args('id', { type: () => String }) id: string,
  ): Promise<RequestDetail> {
    return this.requestsService.getRequestDetail(id);
  }

  //getTimeLineByRequest
  @Query(() => [RequestComment], { name: 'getTimeLineByRequest' })
  @UseGuards(GqlAuthGuard)
  async getTimeLineByRequest(
    @Args('id', { type: () => String }) id: string,
  ): Promise<RequestComment[]> {
    return this.requestsService.getTimeLineByRequest(id);
  }

  @Query(() => [RequestSubtask], { name: 'getSubtasksByRequest' })
  @UseGuards(GqlAuthGuard)
  async getSubtasksByRequest(
    @Args('id', { type: () => String }) id: string,
  ): Promise<RequestSubtask[]> {
    return this.requestsService.getSubtasksByRequest(id);
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.EDIT_REQUESTS)
  async updateRequestFields(
    @Args('input') input: UpdateRequestFieldsInput,
    @Context('req') req: any,
  ): Promise<string> {
    const userId = req.user.sub;
    return this.requestsService.updateRequestFields(input, userId);
  }
}
