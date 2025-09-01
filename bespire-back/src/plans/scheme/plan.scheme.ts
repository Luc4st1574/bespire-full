// plan.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Plan extends Document {
  @Prop({ required: true, unique: true })
  slug: string; // 'starter', 'growth', 'pro'

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  stripePriceId: string; // Relaciona con el Price ID de Stripe

  @Prop({ required: true })
  price: number; // Para mostrar el precio, no para facturar

  @Prop({ required: true })
  creditsPerMonth: number;

  @Prop({ default: 1 })
  brandsAllowed: number;

  @Prop({ default: 1 })
  activeOrdersAllowed: number;

  @Prop({ type: [String], default: [] })
  includedServices: string[]; // ['all', 'branding', ...]

  @Prop({ type: [String], default: [] })
  excludedServices: string[]; // ['advanced_video', ...]

  @Prop({ default: true })
  active: boolean;

  // Campos adicionales para el plan, icon y bg
  @Prop({ default: null })
  icon?: string; // URL del icono del plan

  @Prop({ default: null })
  bg?: string; // URL de la imagen de fondo del plan
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
