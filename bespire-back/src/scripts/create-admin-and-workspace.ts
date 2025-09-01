/* eslint-disable @typescript-eslint/ban-ts-comment */
// scripts/create-admin-user-and-workspace.ts

import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserSchema } from '../users/schemas/user.schema';
import { WorkspaceSchema } from '../workspace/schema/workspace.schema';

// Conecta a MongoDB (asegúrate de usar la URI de tu entorno)
const MONGO_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/bespire';
mongoose.connect(MONGO_URI);
const ADMIN_EMAIL = 'admin@bespire.com';
const ADMIN_PASSWORD = 'admin123456**';

async function main() {
  console.log('Connected to MongoDB');

  const UserModel = mongoose.model('User', UserSchema, 'users');
  const WorkspaceModel = mongoose.model(
    'Workspace',
    WorkspaceSchema,
    'workspaces',
  );

  // 1. Crea el usuario admin si no existe
  let user = await UserModel.findOne({ email: ADMIN_EMAIL });
  if (!user) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    user = await UserModel.create({
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
      registrationStatus: 'completed',
      firstName: 'Admin',
      lastName: 'System',
      isInternalTeam: true,
    });
    console.log('Usuario admin creado:', user.email);
  } else {
    console.log('El usuario admin ya existe:', user.email);
  }

  // 2. Busca o crea el workspace admin
  let workspace = await WorkspaceModel.findOne({
    owner: user._id,
    name: 'Admin Workspace',
  });
  if (!workspace) {
    workspace = await WorkspaceModel.create({
      name: 'Admin Workspace',
      owner: user._id,
      members: [
        {
          user: user._id,
          role: 'admin',
          title: 'Owner',
          teamRole: 'system_admin',
          joinedAt: new Date(),
        },
      ],
      companyName: 'Bespire System',
      hasPaid: true,
      onboardingCompleted: true,
      currentStep: 4,
      credits: 9999,
      planCancelPending: false,
      defaultRequestsView: 'List',
      quickLinks: true,
      getStarted: true,
      planEndsAt: null,
      focusAreas: ['Admin'],
      companyIndustry: 'SaaS',
      companySize: '1-10',
    });
    console.log('Workspace admin creado:', workspace.name);
  } else {
    console.log('El workspace admin ya existe:', workspace.name);
  }

  // 3. Asocia el workspace al user si no lo tiene asignado
  if (
    !user.workspaceSelected ||
    user.workspaceSelected.toString() !== workspace._id.toString()
  ) {
    //@ts-ignore
    user.workspaceSelected = workspace._id;
    await user.save();
    console.log('Workspace asignado al usuario admin.');
  }

  await mongoose.disconnect();
  console.log('Script terminado y desconectado de MongoDB.');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
