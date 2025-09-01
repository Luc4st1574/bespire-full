/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useClientsExtended, ClientExtended } from "@/hooks/useClientsExtended";
import Button from "../ui/Button";
import Plus from "@/assets/icons/plus.svg";
import FilterIcon from "@/assets/icons/filter.svg";
import Dropdown from "../ui/Dropdown";
import AddClientModal from "../modals/AddClientModal";
import ClientDetailModal from "../modals/ClientDetailModal";
import PlanBadge from "../ui/PlanBadge";
import StarRating from "../ui/StarRating";
import ActionMenu from "../ui/ActionMenu";

export default function ClientList() {
  // Use the hook to get clients data
  const { clients, loading, error, refetch } = useClientsExtended();
 const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | number>("");
  
  // Dropdown filter options for client status
  const statusFilterOptions = [
    { value: "all", label: "Filter" },
    { value: "new", label: "New" },
    { value: "recurring", label: "Recurring" },
  ];

  const handleAddClient = (clientData: Record<string, unknown>) => {
    console.log("Adding client:", clientData);
    // Refresh the clients list after adding
    refetch();
  };
  
  const handleViewClientDetail = (clientId: string | number) => {
    setSelectedClientId(clientId);
    setIsDetailModalOpen(true);
  };

  const handleEditClient = (clientId: string | number) => {
    console.log("Editing client:", clientId);
    // Aquí puedes implementar la lógica para editar el cliente
    // Por ejemplo, abrir un modal de edición o navegar a una página de edición
  };

  const handleDeleteClient = (clientId: string | number) => {
    console.log("Deleting client:", clientId);
    // Aquí puedes implementar la lógica para eliminar el cliente
    // Por ejemplo, mostrar un modal de confirmación
    if (window.confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      // Lógica de eliminación
      console.log("Client deleted:", clientId);
    }
  };

  const handleActionClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevenir que se abra el modal de detalle
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-[#F6F8F5] text-[#4C604B]";
      case "recurring":
        return "bg-[#F3FEE7] text-[#566644]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredClients = clients.filter(
    (client: ClientExtended) =>
      (client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       client.companyName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || client.status.toLowerCase() === statusFilter)
  );

  // Handle loading state
  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium text-[#353B38]">Clients</h2>
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                Loading...
              </span>
            </div>
          </div>
        </div>
        <div className="p-8 text-center text-gray-500">
          Loading clients...
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium text-[#353B38]">Clients</h2>
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                Error
              </span>
            </div>
          </div>
        </div>
        <div className="p-8 text-center text-red-500">
          Error loading clients: {error.message}
          <button 
            onClick={() => refetch()} 
            className="ml-2 text-blue-500 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Left side - Title and count */}
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium text-[#353B38]">Clients</h2>
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium">
              {filteredClients.length}
            </span>
          </div>

          {/* Right side - Search, Filter, Add */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search a client"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pr-10 pl-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="#4C5652"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Filter Button */}
            <Dropdown
              items={statusFilterOptions}
              selectedValue={statusFilter}
              onSelect={(item) => setStatusFilter(item.value)}
              placeholder="Filter"
              variant="outlineG"
              size="md"
              icon={FilterIcon}
            />

            {/* Add Button */}
            <Button type="button" variant="green2" size="md"
            onClick={() => setIsAddModalOpen(true)}
            >
              <div className="flex items-center gap-1">
                <span className="text-base">Add</span>
                <Plus className="w-5 h-5 text-white"  />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Table Container with Fixed Actions Column */}
      <div className="relative">
        <div className="overflow-auto max-h-[600px]">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3  text-left text-sm font-medium text-gray-500  tracking-wider min-w-[200px]">
                  <div className="flex items-center gap-2">
                    Client Name
                    <img
                      src="/assets/icons/ChevronDown.svg"
                      alt=""
                      className="h-2 w-2"
                    />
                  </div>
                </th>
                <th className="px-6 py-3 gap-2 text-left text-sm font-medium text-gray-500 tracking-wider min-w-[120px]">
                  <div className="flex items-center gap-2">
                    Plan
                    <img
                      src="/assets/icons/ChevronDown.svg"
                      alt=""
                      className="h-2 w-2"
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500  tracking-wider min-w-[180px]">
                  <div className="flex items-center gap-2">
                    Organization(s)
                    <img
                      src="/assets/icons/ChevronDown.svg"
                      alt=""
                      className="h-2 w-2"
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500
                  tracking-wider min-w-[160px]"
                >
                  <div className="flex items-center gap-2">
                    Ave Rating
                    <img
                      src="/assets/icons/ChevronDown.svg"
                      alt=""
                      className="h-2 w-2"
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500  tracking-wider min-w-[120px]">
                  <div className="flex items-center gap-2">
                    Time/Request
                    <img
                      src="/assets/icons/ChevronDown.svg"
                      alt=""
                      className="h-2 w-2"
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 tracking-wider min-w-[120px]">
                  <div className="flex items-center gap-2">
                    Revisions
                    <img
                      src="/assets/icons/ChevronDown.svg"
                      alt=""
                      className="h-2 w-2"
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500
                 tracking-wider min-w-[160px]"
                >
                  <div className="flex items-center gap-2">
                    Last Session
                    <img
                      src="/assets/icons/ChevronDown.svg"
                      alt=""
                      className="h-2 w-2"
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 
                tracking-wider min-w-[170px]"
                >
                  <div className="flex items-center gap-2">
                    Contract Start
                    <img
                      src="/assets/icons/ChevronDown.svg"
                      alt=""
                      className="h-2 w-2"
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 tracking-wider min-w-[120px]">
                  <div className="flex items-center gap-2">
                    Status
                    <img
                      src="/assets/icons/ChevronDown.svg"
                      alt=""
                      className="h-2 w-2"
                    />
                  </div>
                </th>
                {/* Fixed Actions Column */}
                <th
                  className="sticky right-0 bg-gray-50 px-2 py-3 
                text-left text-sm font-medium text-gray-500 tracking-wider
                 w-14 border-l border-gray-200 relative z-20"
                >
                  <div
                    className="absolute inset-y-0 left-0 w-2  pointer-events-none"
                    style={{
                      boxShadow: "rgba(0, 0, 0, 0.05) -4px -1px 6px 0px",
                    }}
                  ></div>
                  <span className="ml-2"> Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-[#353B38]">
              {filteredClients.map((client: ClientExtended) => (
                <tr 
                  key={client.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewClientDetail(client.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <img
                          className="w-10 h-10 rounded-full"
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            client.name
                          )}&background=e5e7eb&color=374151&size=40`}
                          alt={client.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[#353B38]">
                          {client.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client.roleTitle || 'Client'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PlanBadge 
                      name={client.plan?.name || 'Growth'}
                      icon={client.plan?.icon || '/assets/icons/plans/growth.svg'}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#353B38]">
                    {client.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StarRating rating={client.rating} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#353B38]">
                    {client.timeRequest}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#353B38]">
                    {client.revisions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#353B38]">
                    {client.lastSession 
                      ? new Date(client.lastSession).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      : 'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#353B38]">
                    {client.contractStart 
                      ? new Date(client.contractStart).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      : 'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5
                         rounded-full text-xs font-medium ${getStatusBadgeColor(
                           client.status
                         )}`}
                    >
                      <span className="w-1.5 h-1.5 bg-current rounded-full mr-1.5"></span>
                      {client.status}
                    </span>
                  </td>
                  {/* Fixed Actions Column */}
                  <td 
                    className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-right text-sm font-medium border-l border-gray-200 relative z-20"
                    onClick={handleActionClick}
                  >
                    <div
                      className="absolute inset-y-0 left-0 w-2  pointer-events-none"
                      style={{
                        boxShadow: "rgba(0, 0, 0, 0.05) -4px -1px 6px 0px",
                      }}
                    ></div>

                    <div className="flex justify-center">
                      <ActionMenu
                        onEdit={() => handleEditClient(client.id)}
                        onDelete={() => handleDeleteClient(client.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

        {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddClient}
      />
      
      {/* Client Detail Modal */}
      <ClientDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        clientId={selectedClientId}
      />
    </div>
  );
}
