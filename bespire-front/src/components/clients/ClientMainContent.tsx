import React, { useState } from 'react';
import { Link, X, MoreHorizontal, Bell } from 'lucide-react';
import GenericTabs, { TabConfig } from '../ui/GenericTabs';
import ClientDetailsTab from './tabs/ClientDetailsTab';
import ClientMetricsTab from './tabs/ClientMetricsTab';
import ClientRequestsTab from './tabs/ClientRequestsTab';
import ClientNotesTab from './tabs/ClientNotesTab';
import ClientAssetsTab from './tabs/ClientAssetsTab';
import ClientAboutTab from './tabs/ClientAboutTab';
import DetailsIcon from "@/assets/icons/request_tabs/details.svg";
import TrendIcon from "@/assets/icons/client_detail/Trend.svg";
import RequestIcon from "@/assets/icons/client_detail/send.svg";
import NotesIcon from "@/assets/icons/client_detail/document-text-outline.svg";
import AssetsIcon from "@/assets/icons/client_detail/cube.svg";
import AboutIcon from "@/assets/icons/client_detail/info-circle.svg";
type Tab = "details" | "metrics" | "requests" | "notes" | "assets" | "about";

interface ClientMainContentProps {
  client: any; // En una implementación real, usaríamos un tipo más específico
  onClose: () => void;
}

const ClientMainContent: React.FC<ClientMainContentProps> = ({ client, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>("details");

  // Handler para cambio de tab
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as Tab);
  };

  // Configuración de tabs para el cliente
  const clientTabs: TabConfig[] = [
    {
      id: "details",
      label: "Details",
      icon: (
        <DetailsIcon className="h-5 w-5" />
      )
    },
    {
      id: "metrics",
      label: "Metrics",
      icon: (
        <TrendIcon className="h-5 w-5"  />
      )
    },
    {
      id: "requests",
      label: "Requests",
      icon: (
        <RequestIcon className="h-5 w-5"  />
      )
    },
    {
      id: "notes",
      label: "Notes",
      icon: (
        <NotesIcon className="h-5 w-5"  />
      )
    },
    {
      id: "assets",
      label: "Assets",
      icon: (
        <AssetsIcon className="h-5 w-5"  />
      )
    },
    {
      id: "about",
      label: "About",
      icon: (
        <AboutIcon  className="h-5 w-5"  />
      )
    }
  ];

  const renderTab = (tab: Tab) => {
    switch (tab) {
      case "details":
        return <ClientDetailsTab client={client} />;
      case "metrics":
        return <ClientMetricsTab client={client} />;
      case "requests":
        return <ClientRequestsTab client={client} />;
      case "notes":
        return <ClientNotesTab client={client} />;
      case "assets":
        return <ClientAssetsTab client={client} />;
      case "about":
        return <ClientAboutTab client={client} />;
      default:
        return <ClientDetailsTab client={client} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header - Oculto en móvil */}
      <div className="hidden md:flex items-start justify-between p-3 md:p-6">
        <div className="flex flex-col gap-2 md:gap-4">
          <div className="flex flex-col items-start">
            <h2 className="text-lg md:text-2xl font-semibold">{client.name}</h2>
            <span className="text-sm md:text-lg text-gray-500">{client.role}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            title="Copy Link"
            className="hover:bg-gray-100 p-1.5 md:p-2 rounded-full cursor-pointer hidden md:block"
          >
            <Link className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            type="button"
            title="Notify"
            className="hover:bg-gray-100 p-1.5 md:p-2 rounded-full cursor-pointer hidden md:block"
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            type="button"
            title="More"
            className="hover:bg-gray-100 p-1.5 md:p-2 rounded-full cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            type="button"
            title="Close"
            className="hover:bg-gray-200 p-1.5 md:p-2 rounded-full cursor-pointer"
            onClick={onClose}
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="px-3 md:px-6">
        <GenericTabs 
          tabs={clientTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
      
      {/* Tab Content */}
      <div className="flex-grow overflow-y-auto p-3 md:p-6 w-full mx-auto">
        <div className="max-w-4xl w-full">
          {renderTab(activeTab)}
        </div>
      </div>
    </div>
  );
};

export default ClientMainContent;
