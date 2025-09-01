import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

enum WorkspaceMemberRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

registerEnumType(WorkspaceMemberRole, {
  name: 'WorkspaceMemberRole',
});

@ObjectType()
export class WorkspaceMember {
  @Field(() => ID)
  user: Types.ObjectId;

  @Field(() => WorkspaceMemberRole)
  role: WorkspaceMemberRole;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  teamRole?: string;

  @Field()
  joinedAt: Date;
}

@ObjectType()
@Schema({ timestamps: true })
export class Workspace extends Document {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field(() => ID)
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  owner: Types.ObjectId; // el cliente owner del workspace

  @Field(() => ID)
  @Prop({ required: true, type: Types.ObjectId, ref: 'Company' })
  company: Types.ObjectId; // la empresa a la que pertenece este workspace

  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'User', nullable: true })
  successManager?: Types.ObjectId; // staff interno

  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'User', nullable: true })
  pointOfContact?: Types.ObjectId; // usuario del cliente

  @Field(() => [String], { nullable: true })
  @Prop([String])
  focusAreas?: string[];

  @Field()
  @Prop({ default: 1 })
  currentStep: number;

  @Field()
  @Prop({ default: false })
  onboardingCompleted: boolean;

  @Field(() => [WorkspaceMember])
  @Prop([
    {
      user: { type: Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['admin', 'user', 'viewer'] },
      title: { type: String, required: false }, // Título o rol del miembro en la empresa,
      teamRole: { type: String, required: false }, // Rol del miembro en el equipo (ej: 'Marketing', 'Desarrollo', etc)
      joinedAt: Date,
    },
  ])
  members: {
    user: Types.ObjectId;
    role: 'admin' | 'user' | 'viewer';
    title?: string; // Título o rol del miembro en la empresa
    teamRole?: string; // Rol del miembro en el equipo (ej: 'Marketing', 'Desarrollo', etc)
    joinedAt: Date;
  }[];

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'Plan' })
  plan: Types.ObjectId; // Relaciona con el Plan actual del workspace

  @Field()
  @Prop({ default: false })
  hasPaid: boolean; // Indica si el workspace tiene un plan pagado

  @Field()
  @Prop({ default: 0 })
  credits: number;

  @Field({ nullable: true })
  @Prop({ type: String, default: null })
  stripeCustomerId?: string; // ID del cliente en Stripe

  @Field({ nullable: true })
  @Prop({ type: String, default: null })
  stripeSubscriptionId?: string; // ID de la suscripción en Stripe

  @Field()
  @Prop({ default: 'List' })
  defaultRequestsView: string; // "List" o "Board"

  @Field()
  @Prop({ default: true })
  quickLinks: boolean; // Mostrar quick links en el dashboard

  @Field()
  @Prop({ default: true })
  getStarted: boolean; // Mostrar "Get Started" en el dashboard

  @Field()
  @Prop({ type: Boolean, default: false })
  planCancelPending: boolean; // si hay cancelación pendiente

  @Field({ nullable: true })
  @Prop({ type: Date, default: null })
  planEndsAt: Date; // fecha exacta cuando termina el acceso (stripe.current_period_end)
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
