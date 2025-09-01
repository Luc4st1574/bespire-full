"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react";
import ClientSidebar from "../clients/ClientSidebar";
import ClientMainContent from "../clients/ClientMainContent";

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string | number;
}

export default function ClientDetailModal({
  isOpen,
  onClose,
  clientId,
}: ClientDetailModalProps) {
  // Mock data - En una implementación real, esto vendría del backend
  const client = {
    id: clientId,
    name: "David Kim",
    role: "Senior Product Manager",
    organization: "Spherule",
    email: "davidkim@spherule.com",
    phone: "+1 423-265-0261",
    website: "spherule.com",
    location: "Los Angeles, USA",
    timezone: "PST (Pacific Standard Time)",
    plan: {
      name: "Pro",
      credits: "93/200",
      icon: "/assets/icons/plans/pro.svg"
    },
    contractStart: "March 15, 2022",
    contractRenew: "February 15, 2025",
    successManager: "Liam Parker",
    commonRequests: ["UI/UX", "Graphic Design", "Mobile App Development", "Video Editing"],
    stats: {
      hoursLogged: "24 hours",
      credits: "93/200",
      timePerRequest: "3.2 hours",
      responseTime: "4.3 hours",
      taskVolume: "28 tasks",
      revisionsPerTask: "1.2 revisions",
      rating: "4.8 stars",
      lastSession: "Feb 1, 2025"
    },
    currentStats: {
      newTasks: 6,
      pending: 4,
      completed: 20,
      credits: "93/200"
    },
    phrases: ["Marketing", "Branding", "Print Design", "Blog Design", "UI/UX", "Design System"],
    favoriteMembers: [
      { 
        name: "Michelle Cruz", 
        role: "Senior UX Designer", 
        rating: "4.8", 
        skills: ["UI/UX", "Design System"],
        avatar: "/path/to/avatar1.jpg"
      },
      { 
        name: "Marco Santos", 
        role: "Graphic Designer", 
        rating: "4.5", 
        skills: ["Print Design", "Ads Design"],
        avatar: "/path/to/avatar2.jpg"
      },
      { 
        name: "Jennie Smith", 
        role: "Copywriter", 
        rating: "4.25", 
        skills: ["Email Marketing", "Blog"],
        avatar: "/path/to/avatar3.jpg"
      }
    ],
    mission: "Spherule is the world's leading agency that empowers brands with digital product innovation."
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="fixed inset-0 flex justify-center items-center p-2 sm:p-4 md:justify-end">
        <DialogPanel className="w-full max-w-5xl bg-white overflow-hidden flex flex-col md:flex-row h-full md:h-[95vh] md:w-[1200px] rounded-none md:rounded-lg shadow-lg">
          {/* Componentes modularizados */}
          <ClientSidebar client={client} onClose={onClose} />
          <ClientMainContent client={client} onClose={onClose} />
        </DialogPanel>
      </div>
    </Dialog>
  );
}
