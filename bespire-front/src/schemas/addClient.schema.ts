import { z } from "zod";

// Simplified schema that accepts all fields
export const addClientSchema = z.object({
  option: z.enum(["member", "register", "complete", "edit"]),
  clientName: z.string().min(1, "Name is required"), // Can be client or team member name
  firstName: z.string().optional(), // For new firstName/lastName fields
  lastName: z.string().optional(),
  email: z.string().email("Please enter a valid email"),
  roleTitle: z.string().min(1, "Role is required"), // Can be client role or workspace role
  phoneNumber: z.string().optional(),
  countryCode: z.string(),
  successManager: z.string().optional(), // For register: success manager, for member: team role
  workspaceRole: z.string().optional(), // For editing workspace role
  notes: z.string().optional(),
  companyName: z.string().min(1, "Selection is required"), // For register: company name, for member: workspace selection
  companyWebsite: z.string().optional(),
  companyLocation: z.string().optional(),
  companyId: z.string().optional(), // For adding team member to existing company
  clientId: z.string().optional(),
  sendInvitation: z.boolean(),
  sendConfirmation: z.boolean(),
});

// Type exports
export type AddClientInput = z.infer<typeof addClientSchema>;