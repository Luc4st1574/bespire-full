// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class Preferences {
  @Prop({ type: String, default: 'America/New_York' })
  timezone: string;

  @Prop({ type: Boolean, default: true })
  notifications: boolean;

  // Canales de notificación
  @Prop({
    type: Object,
    default: () => ({ email: true, inApp: true, push: true }),
  })
  channels: {
    email: boolean;
    inApp: boolean;
    push: boolean;
  };

  @Prop({ type: Boolean, default: true })
  newsletter: boolean;

  @Prop({
    type: Object,
    default: () => ({
      requestsAlert: true,
      brandsUpdate: true,
      filesUpdate: true,
      mentionsComments: true,
      sharedItems: true,
      lowOnCredits: true,
      paymentAlerts: true,
    }),
  })
  specific: {
    requestsAlert: boolean;
    brandsUpdate: boolean;
    filesUpdate: boolean;
    mentionsComments: boolean;
    sharedItems: boolean;
    lowOnCredits: boolean;
    paymentAlerts: boolean;
  };

  @Prop({ type: Boolean, default: false })
  hideQuickLinks: boolean;

  @Prop({ type: Boolean, default: false })
  hideGetStarted: boolean;
}

export const PreferencesSchema = SchemaFactory.createForClass(Preferences);
