import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class WorkspaceMemberDto {
  @Field(() => ID)
  _id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  title?: string; // Título del miembro (ej: 'Gerente de Marketing')

  @Field({ nullable: true })
  teamRole?: string; // Rol del miembro en el equipo (ej: 'Marketing', 'Desarrollo', etc)

  //joinedAt
  @Field()
  joinedAt: Date;
}
