import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Preferences, PreferencesSchema } from './preferences.schema';

const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin',
  TEAM_MEMBER: 'team_member',
} as const;

type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export enum TEAM_ROLES {
  DESIGNER = 'designer',
  PRODUCT_MANAGER = 'product_manager',
  CREATIVE_DIRECTOR = 'creative_director',
  PROJECT_MANAGER = 'project_manager',
  DATA_ANALYST = 'data_analyst',
  MARKETING = 'marketing',
  FRONTEND_DEV = 'frontend_dev',
  BACKEND_DEV = 'backend_dev',
  QA = 'qa',
  // etc
}

export const teamRoleLabels: Record<string, string> = {
  designer: 'Designer',
  success_manager: 'Success Manager',
  creative_director: 'Creative Director',
  project_manager: 'Project Manager',
  product_manager: 'Product Manager',
  data_analyst: 'Data Analyst',
  marketing: 'Marketing Specialist',
  frontend_dev: 'Frontend Developer',
  backend_dev: 'Backend Developer',
  qa: 'QA Engineer',
};

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    required: true,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.CLIENT,
  })
  role: UserRole;

  @Prop({
    enum: Object.values(TEAM_ROLES),
    required: false,
  })
  teamRole?: string;

  @Prop()
  firstName?: string; // <-- nuevo campo opcional

  @Prop()
  lastName?: string; // <-- nuevo campo opcional

  @Prop()
  contactNumber?: string; // <-- nuevo campo opcional

  @Prop()
  countryCode?: string; // <-- nuevo campo para código de país

  @Prop()
  notes?: string; // <-- nuevo campo para notas

  @Prop()
  avatarUrl?: string; // <-- nuevo campo opcional

  @Prop({ default: 'in_progress' })
  registrationStatus: 'in_progress' | 'completed';

  @Prop()
  resetToken?: string;

  @Prop()
  resetTokenExpiry?: Date;

  @Prop()
  hasVisitedDashboard?: boolean;

  @Prop({ type: PreferencesSchema, default: () => ({}) })
  preferences: Preferences;

  @Prop({ type: Boolean, default: false })
  isInternalTeam?: boolean; // true si es empleado Bespire

  @Prop({
    type: Types.ObjectId,
    ref: 'Workspace',
    required: false,
    default: null,
  })
  workspaceSelected: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
