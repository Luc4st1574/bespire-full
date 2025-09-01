/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_USER_PROFILE } from "@/graphql/queries/getUserProfile";
import { decodeJWT } from "@/utils/jwt";
import { GET_WORKSPACE_BASIS_BY_ID } from "@/graphql/queries/workspace/getWorkspaceBasisById";
import { REFRESH_TOKEN } from "@/graphql/mutations/auth/refreshToken";

type AppContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
  user: any;
  workspace: any; 
  permissions: string[];
  workspaceRole?: string;
  role?: string;
  loadingUser: boolean;
  loadingWorkspace: boolean;
  refetchUser: () => void;
  refetchWorkspace: () => void;
  //para el modal de request
  showModalRequest: boolean;
  setShowModalRequest: Dispatch<SetStateAction<boolean>>;
  parentId: string | null;
  setParentId: Dispatch<SetStateAction<string | null>>;

  // ADDED FOR EDITOR
  isEditorMode: boolean;
  setIsEditorMode: Dispatch<SetStateAction<boolean>>;
  editorFileName: string;
  setEditorFileName: Dispatch<SetStateAction<string>>;
  saveDoc: () => void;
  setSaveDoc: Dispatch<SetStateAction<() => void>>;
  cancelEdit: () => void;
  setCancelEdit: Dispatch<SetStateAction<() => void>>;
  
  editorTags: string[];
  setEditorTags: Dispatch<SetStateAction<string[]>>;
};

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // --- Auth token y user ---
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);

  //para el modal de request
  const [showModalRequest, setShowModalRequest] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);

  // ADDED FOR EDITOR: State for the document editor view
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [editorFileName, setEditorFileName] = useState("");
  const [saveDoc, setSaveDoc] = useState<() => void>(() => () => {});
  const [cancelEdit, setCancelEdit] = useState<() => void>(() => () => {});

  // NEW: ADDED FOR EDITOR TAGS
  const [editorTags, setEditorTags] = useState<string[]>([]);

  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN);

  // Leer token de localStorage sólo en el cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      if (t && t !== "undefined") setToken(t);
      setTokenLoaded(true);
    }
  }, []);

  // Decodifica el JWT solo si existe
  const decoded = useMemo(
    () => (token ? decodeJWT(token) : null),
    [token]
  );

  // User Profile Query
  const {
    data: userData,
    loading: loadingUserQuery,
    refetch: refetchUserRaw,
  } = useQuery(GET_USER_PROFILE, {
    skip: !token,
    fetchPolicy: "network-only",
  });

  // Workspace Profile Query
  const workspaceId = userData?.getUserProfile?.workspaceSelected;
  const {
    data: workspaceData,
    loading: loadingWorkspaceQuery,
    refetch: refetchWorkspaceRaw,
  } = useQuery(GET_WORKSPACE_BASIS_BY_ID, {
    variables: { workspaceId },
    skip: !workspaceId,
    fetchPolicy: "network-only",
  });

  // Permisos del JWT (del backend)
  const permissions: string[] = useMemo(() => decoded?.permissions || [], [decoded]);
  const workspaceRole: string | undefined = decoded?.workspaceRole;
  const role: string | undefined = decoded?.role;

  // --- Estado de loading global ---
  const loadingUser = !tokenLoaded || loadingUserQuery;
  const loadingWorkspace = loadingUser || loadingWorkspaceQuery;

  // Refetch wrappers para evitar errores si las funciones no están definidas
  const refetchUser = React.useCallback(() => refetchUserRaw && refetchUserRaw(), [refetchUserRaw]);
  const refetchWorkspace = React.useCallback(() => refetchWorkspaceRaw && refetchWorkspaceRaw(), [refetchWorkspaceRaw]);
  
  // Remover console.logs para mejorar performance
  if (process.env.NODE_ENV === 'development') {
    console.log("AppContext: userData", userData);
    console.log("AppContext: workspaceData", workspaceData);  
    console.log("AppContext: permissions", permissions);
    console.log("AppContext: workspaceRole", workspaceRole);
    console.log("AppContext: role", role);
  }

  // Valor global del context - optimizado para evitar re-renders
  const value = useMemo(
    () => ({
      token,
      setToken,
      user: userData?.getUserProfile || null,
      workspace: workspaceData?.getWorkspaceBasisById || null,
      permissions,
      workspaceRole,
      role,
      refetchUser,
      refetchWorkspace,
      loadingUser,
      loadingWorkspace,
      showModalRequest,
      setShowModalRequest,
      parentId,
      setParentId,
      // ADDED FOR EDITOR
      isEditorMode,
      setIsEditorMode,
      editorFileName,
      setEditorFileName,
      saveDoc,
      setSaveDoc,
      cancelEdit,
      setCancelEdit,
      editorTags,
      setEditorTags,
    }),
    [
      token, 
      userData?.getUserProfile, 
      workspaceData?.getWorkspaceBasisById, 
      permissions, 
      workspaceRole, 
      role, 
      loadingUser, 
      loadingWorkspace, 
      showModalRequest, 
      parentId, 
      isEditorMode, 
      editorFileName, 
      saveDoc, 
      cancelEdit, 
      editorTags
    ]
  );

  // Refresca el token
  useEffect(() => {
    if (token) {
      refreshTokenMutation()
        .then(({ data }) => {
          if (data?.refreshToken?.token) {
            setToken(data.refreshToken.token);
            localStorage.setItem("token", data.refreshToken.token);
          }
        })
        .catch(() => {
          setToken(null);
          localStorage.removeItem("token");
        });
    }
  }, [tokenLoaded, refreshTokenMutation]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook para usar el context
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}