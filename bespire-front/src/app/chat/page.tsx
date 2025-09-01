"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import ChatPageMain from "@/components/chat/ChatPageMain";

// This component reads the URL and passes the ID to the main component.
function ChatContent() {
    const searchParams = useSearchParams();
    const chatId = searchParams.get("id");
    return <ChatPageMain chatId={chatId} />;
}

// The main page export
export default function ChatPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <ChatContent />
      </Suspense>
    </DashboardLayout>
  );
}