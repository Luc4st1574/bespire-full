// scripts/create-admin-workspace.ts
import mongoose, { Types } from 'mongoose';
import { ADMIN_WORKSPACE_ID } from '../constants/admin-workspace';
import { WorkspaceSchema } from '../workspace/schema/workspace.schema';

// Conecta a MongoDB (asegúrate de usar la URI de tu entorno)
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tu-db';
mongoose.connect(MONGO_URI);

async function run() {
  // Cuidado: el owner es obligatorio, así que debes poner el ObjectId de algún admin o dejarlo null si lo permites
  // Puedes crear un usuario "adminSystem" y poner su ObjectId aquí.
  // Ejemplo: const ADMIN_OWNER_ID = "665f..."; // cambia esto al ID real de tu admin
  const ADMIN_OWNER_ID = new Types.ObjectId('000000000000000000000000'); // Cambia a un admin real si tienes

  // Verifica si ya existe
  const WorkspaceModel = mongoose.model(
    'Workspace',
    WorkspaceSchema,
    'workspaces',
  );
  const exists = await WorkspaceModel.findById(ADMIN_WORKSPACE_ID);
  if (exists) {
    console.log('Admin workspace already exists:', exists._id);
    process.exit(0);
  }

  // Crea el workspace admin
  const adminWorkspace = await WorkspaceModel.create({
    _id: new Types.ObjectId(ADMIN_WORKSPACE_ID),
    name: 'Admin Workspace',
    owner: ADMIN_OWNER_ID,
    members: [],
    plan: null,
    currentStep: 4,
    onboardingCompleted: true,
    hasPaid: true,
    credits: 99999,
    planCancelPending: false,
    planEndsAt: null,
    quickLinks: false,
    getStarted: false,
    defaultRequestsView: 'List',
    createdAt: new Date(),
    updatedAt: new Date(),
    // Los campos opcionales quedan como undefined/null
  });

  console.log('✅ Admin workspace created:', adminWorkspace._id);
  process.exit(0);
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
