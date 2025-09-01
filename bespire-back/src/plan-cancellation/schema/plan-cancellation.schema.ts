// src/billing/schemas/plan-cancellation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class PlanCancellation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  reason: string;

  @Prop()
  other?: string;

  @Prop()
  canceledAt: Date;
}
export const PlanCancellationSchema =
  SchemaFactory.createForClass(PlanCancellation);
