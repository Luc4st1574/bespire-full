import React, { useState } from 'react';
import PriorityBadge from '../ui/PriorityBadge';

interface Request {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low' | 'none';
  deadline: string;
  status: string;
  createdAt: string;
}

interface ClientRequestsTableProps {
  requests: Request[];
}

type SortField = 'title' | 'priority' | 'deadline';
type SortDirection = 'asc' | 'desc';

const categoryColors: Record<string, string> = {
  "Email Marketing": "bg-[#EBFDD8] text-black",
  "Short-forms": "bg-[#E6EAE2] text-black",
  "E-books": "bg-[#F0F3F4] text-black",
  "Print Design": "bg-[#C3EF9A] text-[#004049]",
  "Illustration": "bg-[#C3EF9A] text-[#004049]",
  "Social Media": "bg-[#EBFDD8] text-black",
  "Ads Design": "bg-[#C3EF9A] text-[#004049]",
  "Presentation": "bg-[#E6EAE2] text-black",
  "Video Editing": "bg-[#F0F3F4] text-black",
  "Packaging": "bg-[#EBFDD8] text-black",
  "Digital Design": "bg-[#C3EF9A] text-[#004049]",
  "Brochure": "bg-[#E6EAE2] text-black",
  "UI/UX": "bg-[#F0F3F4] text-black",
  "Email Design": "bg-[#EBFDD8] text-black",
  "Web Design": "bg-[#C3EF9A] text-[#004049]",
};

const ClientRequestsTable: React.FC<ClientRequestsTableProps> = ({ requests }) => {
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRequests = [...requests].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'priority':
          const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3,
    none: 4
  };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      case 'deadline':
        aValue = new Date(a.deadline).getTime();
        bValue = new Date(b.deadline).getTime();
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const renderPriorityBadge = (request: Request) => {
    return (
      <PriorityBadge
        requestId={request.id}
        priority={request.priority}
        editable={false}
      />
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400 ml-1">↕</span>;
    }
    return (
      <span className="text-gray-700 ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <table className="w-full border-collapse relative z-0">
      <thead>
        <tr className="text-left border-b border-gray-200 text-gray-600">
          <th 
            className="py-3 px-3 cursor-pointer font-medium"
            onClick={() => handleSort('title')}
          >
            Title <SortIcon field="title" />
          </th>
          <th 
            className="py-3 px-3 cursor-pointer font-medium"
            onClick={() => handleSort('priority')}
          >
            Priority <SortIcon field="priority" />
          </th>
          <th 
            className="py-3 px-3 cursor-pointer font-medium"
            onClick={() => handleSort('deadline')}
          >
            Deadline <SortIcon field="deadline" />
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedRequests.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center py-8 text-gray-500">
              No requests found for this status
            </td>
          </tr>
        ) : (
          sortedRequests.map((request) => (
            <tr
              key={request.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
            >
              <td className="py-3 px-4 max-w-[150px]">
                <div className="font-medium text-gray-900 truncate">
                  {request.title}
                </div>
                <div className="text-xs text-[#7A8882]">
                  {formatDate(request.createdAt)} • {request.category}
                </div>
              </td>
              
            
              
              <td className="py-3">
                    <PriorityBadge
                                   requestId={request.id}
                                   priority={request.priority}
                                   editable={false}
                                 />
              </td>
              
              <td className="py-3">
                {formatDate(request.deadline)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default ClientRequestsTable;
