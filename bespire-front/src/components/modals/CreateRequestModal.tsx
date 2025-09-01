/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { X } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import {
  CreateRequestInput,
  createRequestSchema,
} from "@/schemas/createRequest.schema";
import { LinkInputList } from "../form/LinkInputList";
import FileUploader from "../inputs/FileUploader";
import { useMutation, useQuery } from "@apollo/client";
import { GET_SERVICES_AND_BRANDS } from "@/graphql/queries/getServicesAndBrands";
import { CREATE_REQUEST } from "@/graphql/mutations/requests/createRequest";
import { showSuccessToast } from "../ui/toast";
import SpinnerSmall from "../ui/Spinner";
import { useRequests } from "@/hooks/useRequests";
import { useAppContext } from "@/context/AppContext";
import { useRequestSubtasksLazy } from "@/hooks/useRequestSubtasks";

const frequentCategories = [
  {
    icon: "/assets/icons/logo_icon.svg",
    label: "Logo",
    mainType: "Brand",
    subType: "Logo",

  },
  {
    icon: "/assets/icons/social_media_icon.svg",
    label: "Social Media",
    mainType: "Graphic Design",
    subType: "Social Media Graphics",
  },
  {
    icon: "/assets/icons/presentation_icon.svg",
    label: "Presentation",
    mainType: "Graphic Design",
    subType: "Slide or Presentation Deck",
  },
];

const priorities = ["High", "Medium", "Low", "None"];

export default function CreateRequestModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const methods = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      links: [],
      attachments: [],
      priority: "High",
      dueDate: "",
      mainType: "",
      subType: "",
      title: "",
      brand: "",
      details: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = methods;

  const { user, workspace, parentId } = useAppContext();
  const workspaceId = workspace?._id;

  const { refetch } = useRequests();
  const { fetchSubtasks } = useRequestSubtasksLazy();
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const {
    data,
    loading,
    refetch: refetchBrandsServices,
  } = useQuery(GET_SERVICES_AND_BRANDS, {
    variables: { workspaceId },
    skip: !workspaceId,
    fetchPolicy: "cache-first", // o 'cache-and-network', 'network-only', etc.
  });

  console.log("brands data", data)

  // Procesar categories y subtypes
  const categories = useMemo(() => {
    if (!data?.servicesActive) return [];
    // Tipos únicos (category)
    //@ts-ignore
    return [...new Set(data.servicesActive.map((s) => s.type))];
  }, [data]);

  // Subtypes (los manejamos manualmente)
  const [subTypes, setSubTypes] = useState<any[]>([]);
  const [pendingSubType, setPendingSubType] = useState<string | null>(null);

  // Memoizar servicesActive para evitar que cambie la referencia en cada render
  const servicesActive = useMemo(
    () => data?.servicesActive || [],
    [data?.servicesActive]
  );

  // Función para actualizar subTypes basado en el mainType
  const updateSubTypes = useCallback(
    (mainType: string) => {
      if (!servicesActive || !mainType) {
        setSubTypes([]);
        return;
      }
      const filteredSubTypes = servicesActive
        //@ts-ignore
        .filter((s) => s.type === mainType)
        //@ts-ignore
        .map((s) => ({
          title: s.title,
          _id: s._id,
        }));
      setSubTypes(filteredSubTypes);
    },
    [servicesActive]
  );

  // Handler para cuando cambia el select de mainType
  const handleMainTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMainType = e.target.value;
    methods.setValue("mainType", newMainType, { shouldDirty: true });
    methods.setValue("subType", "", { shouldDirty: true });
    updateSubTypes(newMainType);
  }, [methods, updateSubTypes]);

  // Handler para categorías frecuentes
  const handleFrequentCategorySelect = useCallback((category: typeof frequentCategories[0]) => {
    const targetSubType = servicesActive.find(
      (s: any) => s.type === category.mainType && s.title === category.subType
    );

    if (targetSubType) {
      methods.setValue("mainType", category.mainType, { shouldDirty: true });
      updateSubTypes(category.mainType);
      setPendingSubType(targetSubType._id);
    }
  }, [servicesActive, methods, updateSubTypes]);

  // Efecto para establecer el subtipo pendiente después de que la lista se actualice
  useEffect(() => {
    if (pendingSubType && subTypes.some(sub => sub._id === pendingSubType)) {
      methods.setValue("subType", pendingSubType, { shouldDirty: true });
      setPendingSubType(null); // Limpiar para evitar re-asignaciones
    }
  }, [subTypes, pendingSubType, methods]);

  //useEffect para isOpen
  useEffect(() => {
    if (isOpen) {
      refetchBrandsServices();
    
    }
  }, [isOpen, refetchBrandsServices]);

  //console.log("categories", categories, "subtype", subTypes)

  // Brands
  const brands = useMemo(() => data?.brandsForWorkspace || [], [data]);

  interface UploadedFile {
    file: File;
    url?: string;
    name?: string;
    ext?: string;
    size?: number;
    uploadedBy?: string;
    uploadedAt?: string;
    progress: number;
    done: boolean;
    error?: boolean;
  }

  const [createRequest] = useMutation(CREATE_REQUEST);

  const attachments = watch("attachments") as UploadedFile[];
  const onSubmit = async (data: CreateRequestInput) => {
    console.log("on submit , attachments", attachments);
    setLoadingSubmit(true);
    console.log("REQUEST DATA:", data);
    const payload = {
      title: data.title,
      details: data.details,
      brand: data.brand,
      service: data.subType,
      priority: data.priority.toLowerCase(),
      dueDate: data.dueDate,
      links: data.links?.map((l) => ({
        url: l.url,
        title: l.title,
        favicon: l.favicon,
      })),
      attachments: attachments
        .filter((a) => a.url)
        .map((a) => ({
          name: a.file?.name || a.name, // si viene de S3 ya procesado puede tener solo .name
          url: a.url,
          ext: a.file?.name?.split(".").pop() || a.ext || "",
          size: a.file?.size || a.size || 0,
          uploadedBy: user?._id || "", // ID del usuario que crea la request
          uploadedAt: new Date().toISOString(), // Fecha actual
        })),
      workspace: workspaceId,
      ...(parentId ? { parentRequest: parentId } : {}),
    };

    console.log("payload", payload);

    try {
      const res = await createRequest({ variables: { input: payload } });
      console.log("Create Request Response:", res);
      if (res.data?.createRequest) {
        setLoadingSubmit(false);
        // Mostrar mensaje de éxito
        console.log("Request created successfully:", res.data.createRequest);
        await fetchSubtasks();
        if (parentId) {
          await fetchSubtasks({ variables: { id: parentId } });
        }
        await refetch(); // Refrescar la lista de requests
        onClose();
        reset();
        showSuccessToast("Request Created!");
      }
    } catch (err: any) {
      // Apollo lanza un error, lo puedes mostrar aquí
      console.error("Error creating request:", err.message);
      setErrorSubmit(err.message);
      // showErrorToast(err.message)
      setLoadingSubmit(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50 p-4">
      <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="fixed inset-0 flex justify-end">
        <DialogPanel className="w-full text-sm max-w-md m-2 bg-white p-8 overflow-y-auto rounded-xl flex flex-col gap-4">
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit, (formErrors) => {
                console.log("Form validation errors:", formErrors);
              })}
              className="flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <DialogTitle className="text-xl font-semibold">
                  Create New Request
                </DialogTitle>
                <button
                  onClick={onClose}
                  type="button"
                  className="text-gray-600 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Frequent Categories */}
              <div>
                <p className="font-medium text-sm text-gray-700">
                  Frequently requested
                </p>
                <div className="flex gap-2">
                  {frequentCategories.map((cat) => (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => handleFrequentCategorySelect(cat)}
                      className={clsx(
                        "w-full py-2 px-3 border rounded-md text-sm flex flex-col items-start gap-2 transition",
                        watch("mainType") === cat.mainType &&
                          watch("subType") === cat.subType
                          ? "bg-[#F1F3EE] border-[#758C5D] text-[#181B1A]"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <img src={cat.icon} alt={cat.label} className="w-4 h-4" />
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Type & Sub Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700">
                    Or choose from the list
                  </label>
                  <select
                    value={watch("mainType") || ""}
                    onChange={handleMainTypeChange}
                    className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      //@ts-ignore
                      <option key={cat} value={cat}>
                        {String(cat)}
                      </option>
                    ))}
                  </select>
                  {errors.mainType && (
                    <span className="text-red-500">
                      {errors.mainType.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700">
                    Request Sub-type
                  </label>
                  <select
                    {...register("subType")}
                    className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
                  >
                    <option value="">Select sub-type</option>
                    {
                      //@ts-ignore
                      subTypes.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.title}
                        </option>
                      ))
                    }
                  </select>
                  {errors.subType && (
                    <span className="text-red-500">
                      {errors.subType.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="font-medium">Title</label>
                <input
                  {...register("title")}
                  placeholder="Enter request title"
                  className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
                />
                {errors.title && (
                  <span className="text-red-500">{errors.title.message}</span>
                )}
              </div>

              {/* Brand */}
              <div>
                <label className="font-medium">Brand</label>
                <select
                  {...register("brand")}
                  className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
                >
                  <option value="">Select Brand</option>
                  {
                    //@ts-ignore
                    brands.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))
                  }
                </select>
                {errors.brand && (
                  <span className="text-red-500">{errors.brand.message}</span>
                )}
              </div>

              {/* Priority y Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Priority</label>
                  <select
                    {...register("priority")}
                    className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
                  >
                    {priorities.map((pr) => (
                      <option key={pr} value={pr}>
                        {pr}
                      </option>
                    ))}
                  </select>
                  {errors.priority && (
                    <span className="text-red-500">
                      {errors.priority.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="font-medium">Date Needed</label>
                  <input
                    type="date"
                    {...register("dueDate")}
                    className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
                  />
                  {errors.dueDate && (
                    <span className="text-red-500">
                      {errors.dueDate.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="font-medium">Request Details</label>
                <textarea
                  {...register("details")}
                  placeholder="Enter details here"
                  rows={3}
                  className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#758C5D] focus:border-transparent"
                />
                {errors.details && (
                  <span className="text-red-500">{errors.details.message}</span>
                )}
              </div>

              {/* Links (Preview Only) */}
              <LinkInputList name="links" />

              {/* Attachments (Placeholder) */}
              <FileUploader
                value={attachments}
                onChange={(files) => {
                  console.log("nuevos files", files);
                  // Solo guardar en el form los que tienen URL lista
                  setValue(
                    "attachments",
                    //@ts-ignore
                    files
                  );
                }}
              />

              {/* Botones */}
              <div className="flex justify-center mt-4">
                <p className="text-red-500 text-center">{errorSubmit}</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-full border border-gray-400 text-sm text-[#181B1A] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={clsx(
                    "px-6 py-2 rounded-full text-sm",
                    "bg-[#5E6B66] text-white hover:bg-[#4b5a52]"
                  )}
                >
                  {loadingSubmit ? <SpinnerSmall /> : "Create Request"}
                </button>
              </div>
            </form>
          </FormProvider>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
