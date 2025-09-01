/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback, // Import useCallback
  Dispatch,
  SetStateAction,
} from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_USER_PROFILE } from "@/graphql/queries/getUserProfile";
import { decodeJWT } from "@/utils/jwt";
import { GET_WORKSPACE_BASIS_BY_ID } from "@/graphql/queries/workspace/getWorkspaceBasisById";
import { REFRESH_TOKEN } from "@/graphql/mutations/auth/refreshToken";
import chatsData from "@/data/chats.json"; 

// --- Type Definitions ---
type Media = {
  url: string;
  thumbnail: string;
  type: 'image' | 'video';
  timestamp: string;
};

type SharedFile = {
    name: string;
    size: string;
    type: string;
};

type ConversationMessage = {
    sender: string;
    text: string;
    timestamp: string;
};

export type Chat = {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
  timestamp: string;
  lastMessage: string | null;
  unreadCount: number;
  role: string;
  email: string;
  phone: string;
  organization: string;
  timezone: string;
  sharedLinks: string[];
  media: Media[];
  sharedFiles: SharedFile[];
  conversation: ConversationMessage[];
};


// --- Main App Context Type ---
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
  showModalRequest: boolean;
  setShowModalRequest: Dispatch<SetStateAction<boolean>>;
  parentId: string | null;
  setParentId: Dispatch<SetStateAction<string | null>>;
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
  chats: Chat[];
  markChatAsRead: (chatId: number) => void;
  markAllChatsAsRead: () => void;
};

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [showModalRequest, setShowModalRequest] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [editorFileName, setEditorFileName] = useState("");
  const [saveDoc, setSaveDoc] = useState<() => void>(() => () => {});
  const [cancelEdit, setCancelEdit] = useState<() => void>(() => () => {});
  const [editorTags, setEditorTags] = useState<string[]>([]);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN);

  const [chats, setChats] = useState<Chat[]>(() =>
    [...(chatsData as Chat[])].sort((a, b) => {
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
        if (a.lastMessage && !b.lastMessage) return -1;
        if (!a.lastMessage && b.lastMessage) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })
  );

  // **THE FIX**: Wrap state-updating functions in useCallback
  const markChatAsRead = useCallback((chatId: number) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
  }, []);

  const markAllChatsAsRead = useCallback(() => {
    setChats(prevChats =>
      prevChats.map(chat => ({ ...chat, unreadCount: 0 }))
    );
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      if (t && t !== "undefined") setToken(t);
      setTokenLoaded(true);
    }
  }, []);

  const decoded = useMemo(
    () => (token ? decodeJWT(token) : null),
    [token]
  );

  const {
    data: userData,
    loading: loadingUserQuery,
    refetch: refetchUserRaw,
  } = useQuery(GET_USER_PROFILE, {
    skip: !token,
    fetchPolicy: "network-only",
  });

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

  const permissions: string[] = useMemo(() => decoded?.permissions || [], [decoded]);
  const workspaceRole: string | undefined = decoded?.workspaceRole;
  const role: string | undefined = decoded?.role;
  const loadingUser = !tokenLoaded || loadingUserQuery;
  const loadingWorkspace = loadingUser || loadingWorkspaceQuery;
  const refetchUser = React.useCallback(() => refetchUserRaw && refetchUserRaw(), [refetchUserRaw]);
  const refetchWorkspace = React.useCallback(() => refetchWorkspaceRaw && refetchWorkspaceRaw(), [refetchWorkspaceRaw]);
  
  if (process.env.NODE_ENV === 'development') {
    console.log("AppContext: userData", userData);
    console.log("AppContext: workspaceData", workspaceData);   
    console.log("AppContext: permissions", permissions);
    console.log("AppContext: workspaceRole", workspaceRole);
    console.log("AppContext: role", role);
  }

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
      chats,
      markChatAsRead,
      markAllChatsAsRead,
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
      editorTags,
      chats,
      markChatAsRead,
      markAllChatsAsRead
    ]
  );

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

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}