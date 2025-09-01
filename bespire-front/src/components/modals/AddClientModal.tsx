"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import {
  AddClientInput,
  addClientSchema,
} from "@/schemas/addClient.schema";
import { useClients } from "@/hooks/useClients";
import { useSuccessManagers } from "@/hooks/useSuccessManagers";
import { useAllClients, useUpdateClientInfo, ClientWithWorkspaceInfo } from "@/hooks/useAllClients";
import { toast } from "sonner";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import AddClient from "@/assets/icons/add_client.svg";
import PreClient from "@/assets/icons/pre_client.svg";
import EditClient from "@/assets/icons/edit_client.svg";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientData: AddClientInput) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedOption, setSelectedOption] = useState<"member" | "register" | "complete" | "edit">("member");
  const [selectedClient, setSelectedClient] = useState<ClientWithWorkspaceInfo | null>(null);

  // Hook para manejo de clientes
  const { preRegisterClient, preRegisterLoading } = useClients();
  
  // Hook para obtener success managers
  const { successManagers, loading: loadingManagers } = useSuccessManagers();
  
  // Hook para obtener todos los clientes y actualizar información
  const { clients, loading: loadingClients, refetch: refetchClients } = useAllClients();
  const { updateClientInfo, loading: updateLoading } = useUpdateClientInfo();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<AddClientInput>({
    resolver: zodResolver(addClientSchema),
    defaultValues: {
      option: "member",
      clientName: "",
      firstName: "",
      lastName: "",
      email: "",
      roleTitle: "",
      phoneNumber: "",
      countryCode: "+1",
      successManager: "",
      workspaceRole: "",
      notes: "",
      sendInvitation: true,
      companyName: "",
      companyWebsite: "",
      companyLocation: "",
      clientId: "",
      sendConfirmation: false,
    },
  });

  // Options for the three main choices
  const clientOptions = [
    {
      id: "member" as const,
      title: "Add Team Member",
      description: "Add a team member to client workspace",
      icon: <AddClient className="h-6 w-6 text-[#697D67]" />
    },
    {
      id: "register" as const,
      title: "Pre-register a Client",
      description: "Pre-register a new client",
      icon: <PreClient className="h-6 w-6 text-[#697D67]" />,
    },
    {
      id: "edit" as const,
      title: "Edit/Complete  a Client Info",
      description: "Edit existing client information",
      icon: <EditClient className="h-6 w-6 text-[#697D67]" />,
    },
 
  ];

  // Dropdown options
  const workspaceOptions = [
    { value: "", label: "Select Client's Workspace" },
    ...(clients.length > 0 ? 
      // Crear opciones únicas basadas en las companies de los clientes existentes
      Array.from(new Set(clients.map(client => client.companyName)))
        .filter(companyName => companyName) // Filtrar nombres vacíos
        .map(companyName => ({
          value: companyName,
          label: companyName
        }))
      : [
        // Opciones fallback si no hay clientes
        { value: "visionary-workspace", label: "Visionary Designs" },
        { value: "spherule-workspace", label: "Spherule" },
        { value: "innovator-workspace", label: "Innovator LLC" },
      ]
    )
  ];

  const memberRoleOptions = [
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
    { value: "viewer", label: "Viewer" },
  ];

  const clientOptionsEdit = [
    { value: "", label: loadingClients ? "Loading clients..." : "Select from Client's List" },
    ...clients.map(client => ({
      value: client.id,
      label: `${client.name} - ${client.companyName}`,
      client: client
    }))
  ];

  const successManagerOptions = [
    { value: "", label: loadingManagers ? "Loading managers..." : "Select a Success Manager" },
    ...successManagers.map(manager => ({
      value: manager.id,
      label: manager.name
    }))
  ];

  const countryCodeOptions = [
    "+1", "+44", "+33", "+49", "+52", "+34", "+39"
  ];

  // Función para manejar la selección de cliente y prellenar formulario
  const handleClientSelection = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      
      // Separar el nombre en firstName y lastName
      const nameParts = client.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Prellenar el formulario con los datos del cliente
      setValue("clientName", client.name);
      setValue("firstName", firstName);
      setValue("lastName", lastName);
      setValue("email", client.email);
      setValue("roleTitle", client.roleTitle || "");
      setValue("phoneNumber", client.phoneNumber || "");
      setValue("countryCode", client.countryCode || "+1");
      setValue("workspaceRole", client.workspaceRole || "");
      setValue("notes", client.notes || "");
      
      // Si es owner del workspace, prellenar datos de la company
      if (client.isWorkspaceOwner) {
        setValue("companyName", client.companyName);
        setValue("companyWebsite", client.companyWebsite || "");
        setValue("companyLocation", client.companyLocation || "");
        setValue("successManager", client.successManagerId || "");
      }
      
      // Asegurar que no se muestren campos incorrectos
      setValue("sendInvitation", false);
      setValue("sendConfirmation", true);
    }
  };

  const handleOptionChange = (optionId: "member" | "register" | "complete" | "edit") => {
    setSelectedOption(optionId);
    setValue("option", optionId);
    
    // Limpiar el cliente seleccionado al cambiar de opción
    setSelectedClient(null);
    
    // Reset form when changing options
    reset({
      option: optionId,
      clientName: "",
      firstName: "",
      lastName: "",
      email: "",
      roleTitle: "",
      phoneNumber: "",
      countryCode: "+1",
      successManager: "",
      workspaceRole: "",
      notes: "",
      sendInvitation: optionId === "register" || optionId === "member", // Solo para register y member
      companyName: "",
      companyWebsite: "",
      companyLocation: "",
      clientId: "",
      sendConfirmation: optionId === "edit", // Solo para edit
    });
  };

  const onFormSubmit = async (data: AddClientInput) => {
    try {
      if (selectedOption === "edit") {
        // Handle edit client info
        if (!data.clientId) {
          toast.error("Please select a client to edit");
          return;
        }

        const updateInput = {
          clientId: data.clientId,
          email: data.email,
          clientName: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : data.clientName,
          phoneNumber: data.phoneNumber,
          countryCode: data.countryCode,
          notes: data.notes,
          ...(selectedClient?.isWorkspaceOwner && {
            companyName: data.companyName,
            companyWebsite: data.companyWebsite,
            companyLocation: data.companyLocation,
            successManager: data.successManager || undefined,
          }),
          ...(!selectedClient?.isWorkspaceOwner && {
            workspaceRole: data.workspaceRole,
          }),
          sendConfirmation: data.sendConfirmation || false,
        };

        console.log('Update input being sent:', updateInput);
        await updateClientInfo(updateInput);
        
        // Mostrar toast personalizado al éxito con mensaje dinámico
        const message = data.sendConfirmation 
          ? "Client information updated and confirmation email sent!" 
          : "Client information updated successfully!";
        showSuccessToast(message);
        
        // Refetch clients to update the list
        if (refetchClients) {
          await refetchClients();
        }
      } else if (selectedOption === "member") {
        // Handle add team member to existing workspace
        await preRegisterClient({
          clientName: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : data.clientName,
          email: data.email,
          roleTitle: data.roleTitle || "USER", // Workspace role (admin, user, viewer)
          teamRole: data.workspaceRole || "", // Team role (developer, designer, etc.)
          phoneNumber: data.phoneNumber,
          countryCode: data.countryCode || "+1",
          companyName: data.companyName, // Selected workspace/company
          notes: data.notes,
          sendInvitation: data.sendInvitation || false,
          isTeamMember: true, // Flag para indicar que es un team member
        });

        // Mostrar toast personalizado al éxito con mensaje dinámico
        const message = data.sendInvitation 
          ? "Team member added and invitation email sent!" 
          : "Team member added successfully!";
        showSuccessToast(message);

        // Refetch clients to update the list
        if (refetchClients) {
          await refetchClients();
        }
      } else if (selectedOption === "register") {
        // Handle pre-register new client (new company)
        await preRegisterClient({
          clientName: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : data.clientName,
          email: data.email,
          roleTitle: data.roleTitle || "CLIENT",
          phoneNumber: data.phoneNumber,
          countryCode: data.countryCode || "+1",
          companyName: data.companyName,
          companyWebsite: data.companyWebsite,
          companyLocation: data.companyLocation,
          successManager: data.successManager,
          notes: data.notes,
          sendInvitation: data.sendInvitation || false,
        });
        
        // Mostrar toast personalizado al éxito con mensaje dinámico
        const message = data.sendInvitation 
          ? "Client pre-registered and invitation email sent!" 
          : "Client pre-registered successfully!";
        showSuccessToast(message);

        // Refetch clients to update the list
        if (refetchClients) {
          await refetchClients();
        }
      } else {
        // Para "complete" option, usar el callback original
        onSubmit(data);
      }

      // Reset form and close modal on success
      reset();
      setSelectedClient(null);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      // El error ya se maneja en el hook con toast
      const errorMessage = error instanceof Error ? error.message : "Error submitting form";
      showErrorToast(errorMessage);
    }
  };

  // Form for adding team member to workspace
  function AddTeamMemberForm() {
    return (
      <>
        {/* Client Workspace */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Client Workspace
          </label>
          <select
            {...register("companyName")} // Reutilizamos este campo para workspace
            className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
          >
            {workspaceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.companyName && (
            <span className="text-red-500 text-xs">{errors.companyName.message}</span>
          )}
        </div>

        {/* Team Member Name */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Team Member Name
          </label>
          <input
            {...register("clientName")} // Reutilizamos para member name
            type="text"
            placeholder="Enter Team Member Name"
            className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
          />
          {errors.clientName && (
            <span className="text-red-500 text-xs">{errors.clientName.message}</span>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter Team Member Email"
            className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
          />
          {errors.email && (
            <span className="text-red-500 text-xs">{errors.email.message}</span>
          )}
        </div>

        {/* Workspace Role */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Workspace Role
          </label>
          <select
            {...register("roleTitle")} // Reutilizamos para workspace role
            className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
          >
            <option value="">Select Role</option>
            {memberRoleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.roleTitle && (
            <span className="text-red-500 text-xs">{errors.roleTitle.message}</span>
          )}
        </div>

        {/* Team Role */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Team Role (Optional)
          </label>
          <input
            {...register("workspaceRole")} // Cambiamos a workspaceRole para team role
            type="text"
            placeholder="Enter Team Role (e.g., Developer, Designer, Manager)"
            className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Phone Number (Optional)
          </label>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <select
              {...register("countryCode")}
              className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
            >
              {countryCodeOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <input
              {...register("phoneNumber")}
              type="tel"
              placeholder="Enter Phone Number"
              className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            {...register("notes")}
            placeholder="Enter Notes"
            rows={3}
            className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent resize-none"
          />
        </div>

        {/* Send invitation email */}
        <div className="flex items-center gap-2">
          <input
            {...register("sendInvitation")}
            type="checkbox"
            id="sendInvitation"
            className="w-4 h-4 text-[#758C5D] border-gray-300 rounded focus:ring-[#758C5D]"
          />
          <label htmlFor="sendInvitation" className="text-sm text-gray-700">
            Send invitation email to team member
          </label>
        </div>

        <p className="text-xs text-gray-500">
          Team member will be added to the selected workspace. If the email already exists, they will be added as a member. If not, a new account will be created.
        </p>
      </>
    );
  }

  // Form for pre-registering a client
  function PreRegisterForm() {
    return (
      <>
        {/* Company Name */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            {...register("companyName")}
            type="text"
            placeholder="Enter Company Name"
            className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
          />
          {errors.companyName && (
            <span className="text-red-500 text-xs">{errors.companyName.message}</span>
          )}
        </div>

        <CommonFields />

        {/* Company Website */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Company Website
          </label>
          <input
            {...register("companyWebsite")}
            type="url"
            placeholder="Enter Company Website"
            className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
          />
          {errors.companyWebsite && (
            <span className="text-red-500 text-xs">{errors.companyWebsite.message}</span>
          )}
        </div>

        {/* Company Location */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Company Location
          </label>
          <input
            {...register("companyLocation")}
            type="text"
            placeholder="Enter Company Location"
            className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
          />
          {errors.companyLocation && (
            <span className="text-red-500 text-xs">{errors.companyLocation.message}</span>
          )}
        </div>
      </>
    );
  }

  // Form for editing client info
  function EditClientForm() {
    return (
      <>
        {/* Select a Client */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Select a Client
          </label>
          <select
            {...register("clientId")}
            onChange={(e) => {
              setValue("clientId", e.target.value);
              if (e.target.value) {
                handleClientSelection(e.target.value);
              }
            }}
            className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
          >
            {clientOptionsEdit.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <span className="text-red-500 text-xs">{errors.clientId.message}</span>
          )}
        </div>

        {/* Solo mostrar el resto del formulario si hay un cliente seleccionado */}
        {selectedClient && (
          <>
            {/* Campos comunes */}
            <CommonFields />

            {/* Si es owner del workspace, mostrar campos de company */}
            {selectedClient.isWorkspaceOwner && (
              <>
                {/* Company Name */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    {...register("companyName")}
                    type="text"
                    placeholder="Enter Company Name"
                    className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
                  />
                  {errors.companyName && (
                    <span className="text-red-500 text-xs">{errors.companyName.message}</span>
                  )}
                </div>

                {/* Company Website */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    Company Website
                  </label>
                  <input
                    {...register("companyWebsite")}
                    type="url"
                    placeholder="Enter Company Website"
                    className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
                  />
                  {errors.companyWebsite && (
                    <span className="text-red-500 text-xs">{errors.companyWebsite.message}</span>
                  )}
                </div>

                {/* Company Location */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    Company Location
                  </label>
                  <input
                    {...register("companyLocation")}
                    type="text"
                    placeholder="Enter Company Location"
                    className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
                  />
                  {errors.companyLocation && (
                    <span className="text-red-500 text-xs">{errors.companyLocation.message}</span>
                  )}
                </div>
              </>
            )}

            {/* Si NO es owner, mostrar campo de workspace role */}
            {!selectedClient.isWorkspaceOwner && (
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Workspace Role
                </label>
                <select
                  {...register("workspaceRole")}
                  className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
                >
                  <option value="">Select Role</option>
                  {memberRoleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.workspaceRole && (
                  <span className="text-red-500 text-xs">{errors.workspaceRole.message}</span>
                )}
              </div>
            )}

            {/* Success Manager - solo para workspace owners */}
            {selectedClient.isWorkspaceOwner && (
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Success Manager
                </label>
                <select
                  {...register("successManager")}
                  className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
                >
                  {successManagerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.successManager && (
                  <span className="text-red-500 text-xs">{errors.successManager.message}</span>
                )}
              </div>
            )}

            {/* Send confirmation instead of invitation */}
            <div className="flex items-center gap-2">
              <input
                {...register("sendConfirmation")}
                type="checkbox"
                id="sendConfirmation"
                className="w-4 h-4 text-[#758C5D] border-gray-300 rounded focus:ring-[#758C5D]"
              />
              <label htmlFor="sendConfirmation" className="text-sm text-gray-700">
                Send confirmation and changes to client
              </label>
            </div>

            {/* Info text */}
            <p className="text-xs text-gray-500">
              Client will be notified about the changes made to their information.
            </p>
          </>
        )}
      </>
    );
  }

  // Common fields for all forms
  function CommonFields() {
    return (
      <>
        {/* Client Name */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Client Name
          </label>
          <input
            {...register("clientName")}
            type="text"
            placeholder="Enter Client Name"
            className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
          />
          {errors.clientName && (
            <span className="text-red-500 text-xs">{errors.clientName.message}</span>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter Client Email"
            className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
          />
          {errors.email && (
            <span className="text-red-500 text-xs">{errors.email.message}</span>
          )}
        </div>

        {/* Role/Title */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Role/Title
          </label>
          <input
            {...register("roleTitle")}
            type="text"
            placeholder="Enter Role/Title"
            className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
          />
          {errors.roleTitle && (
            <span className="text-red-500 text-xs">{errors.roleTitle.message}</span>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <select
              {...register("countryCode")}
              className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
            >
              {countryCodeOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <input
              {...register("phoneNumber")}
              type="tel"
              placeholder="Enter Phone Number"
              className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
            />
          </div>
          {errors.phoneNumber && (
            <span className="text-red-500 text-xs">{errors.phoneNumber.message}</span>
          )}
        </div>

        {/* Assign a Success Manager - Only for client registration */}
        {selectedOption === "register" && (
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Assign a Success Manager
            </label>
            <select
              {...register("successManager")}
              className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
            >
              {successManagerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.successManager && (
              <span className="text-red-500 text-xs">{errors.successManager.message}</span>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            {...register("notes")}
            placeholder="Enter Notes"
            rows={4}
            className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent resize-none"
          />
          {errors.notes && (
            <span className="text-red-500 text-xs">{errors.notes.message}</span>
          )}
        </div>

        {/* Send invitation email - only for existing and register */}
        {selectedOption !== "complete" && selectedOption !== "edit" && (
          <>
            <div className="flex items-center gap-2">
              <input
                {...register("sendInvitation")}
                type="checkbox"
                id="sendInvitation"
                className="w-4 h-4 text-[#758C5D] border-gray-300 rounded focus:ring-[#758C5D]"
              />
              <label htmlFor="sendInvitation" className="text-sm text-gray-700">
                Send invitation email to client
              </label>
            </div>

            <p className="text-xs text-gray-500">
              Clients will be prompted to complete their account setup after joining.
            </p>
          </>
        )}
      </>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50 p-4">
      <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="fixed inset-0 flex justify-end">
        <DialogPanel className="w-full text-sm max-w-md m-2 bg-white overflow-hidden rounded-xl flex flex-col">
          {/* Header - Fixed */}
          <div className="flex justify-between items-start p-8 pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-semibold">
              Add a Client
            </DialogTitle>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-600 hover:text-black"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-8 pt-4">
            <form id="client-form" onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4">
              {/* Choose from options */}
              <div>
                <p className="font-medium text-sm text-gray-700 mb-3">
                  Choose from options
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {clientOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleOptionChange(option.id)}
                      className={clsx(
                        "p-3 border rounded-md text-left transition-all flex flex-col items-start gap-2",
                        selectedOption === option.id
                          ? "bg-[#F1F3EE] border-[#758C5D] text-[#181B1A]"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {option.icon}
                      <div className="text-xs font-medium leading-tight">
                        {option.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Forms */}
              {selectedOption === "member" && <AddTeamMemberForm />}
              {selectedOption === "register" && <PreRegisterForm />}
              {selectedOption === "edit" && <EditClientForm />}
              {selectedOption === "complete" && <EditClientForm />}
            </form>
          </div>

          {/* Footer - Fixed */}
          <div className="p-6 border-t border-gray-100 bg-white">
            <div className="flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={preRegisterLoading || updateLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="client-form"
                disabled={preRegisterLoading || updateLoading}
                className={clsx(
                  "flex-1 px-6 py-3 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                  "bg-[#5E6B66] text-white hover:bg-[#4b5a52]",
                  (preRegisterLoading || updateLoading) && "opacity-50 cursor-not-allowed"
                )}
              >
                {((preRegisterLoading && (selectedOption === "register" || selectedOption === "member")) || 
                  (updateLoading && selectedOption === "edit")) && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {selectedOption === "member" ? "Add Team Member" : 
                 selectedOption === "register" ? "Pre-register Client" : 
                 selectedOption === "edit" ? "Update Client Info" :
                 "Complete Client Info"}
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default AddClientModal;