// src/constants/admin-workspace.mock.ts

export const ADMIN_WORKSPACE_MOCK = {
  _id: '000000000000000000000000', // Puedes usar un ObjectId falso fijo
  name: 'Admin System Workspace',
  owner: {
    _id: '000000000000000000000001',
    email: 'admin@system.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  },
  members: [],
  hasPaid: true,
  credits: 99999,
  planCancelPending: false,
  planEndsAt: null,
  onboardingCompleted: true,
  companyName: 'ADMIN SYSTEM',
  quickLinks: true,
  getStarted: true,
  currentStep: 4,
  createdAt: new Date(),
  updatedAt: new Date(),
};
