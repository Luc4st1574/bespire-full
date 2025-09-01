// src/context/RequestContext.tsx
import React, { createContext, useContext, ReactNode } from "react";

type RequestContextValue = {
  status: string;
  completed: boolean;
  isBlocked: boolean; // Bloqueado si está completed y no es admin
  role?: string;
};

const RequestContext = createContext<RequestContextValue | undefined>(
  undefined
);

export function RequestProvider({
  status,
  role,
  children,
}: {
  status: string;
  role?: string;
  children: ReactNode;
}) {
  const completed = status === "completed";
  const isBlocked = completed && role !== "admin";
  
  return (
    <RequestContext.Provider
      value={{ status, completed, isBlocked, role }}
    >
      {children}
    </RequestContext.Provider>
  );
}

export function useRequestContext(): RequestContextValue {
  const ctx = useContext(RequestContext);
  if (!ctx)
    throw new Error(
      "useRequestContext must be used inside a <RequestProvider>"
    );
  return ctx;
}
