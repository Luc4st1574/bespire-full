import React, { useState, useMemo } from 'react';
import ClientRequestsTabs from '../ClientRequestsTabs';
import ClientRequestsTable from '../ClientRequestsTable';
import { getRequestsByStatus, getRequestsCounts } from '@/mocks/clientRequests';

interface ClientRequestsTabProps {
  client: any; // En una implementación real, usaríamos un tipo más específico
}

const ClientRequestsTab: React.FC<ClientRequestsTabProps> = ({ client }) => {
  const [activeTab, setActiveTab] = useState('all');

  // Obtener conteos dinámicos
  const counts = useMemo(() => getRequestsCounts(), []);

  // Configurar tabs con conteos
  const tabs = useMemo(() => [
    { id: 'all', label: 'Requests', count: counts.all },
    { id: 'in_progress', label: 'In Progress', count: counts.in_progress },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ], [counts]);

  // Filtrar requests según tab activo
  const filteredRequests = useMemo(() => {
    return getRequestsByStatus(activeTab);
  }, [activeTab]);

  return (
    <div className="bg-white rounded-lg border border-[#bcbcbc47] max-w-full overflow-x-auto">
      {/* Tabs */}
      <ClientRequestsTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={tabs}
      />

      {/* Table */}
      <div className="p-0">
        <ClientRequestsTable requests={filteredRequests} />
      </div>
    </div>
  );
};

export default ClientRequestsTab;
