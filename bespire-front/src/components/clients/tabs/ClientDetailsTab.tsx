import React from 'react';
import CommonRequestBadge from '@/components/ui/CommonRequestBadge';
import Dropdown from '@/components/ui/Dropdown';
import MemberCard from '@/components/ui/MemberCard';

interface ClientDetailsTabProps {
  client: any; // En una implementación real, usaríamos un tipo más específico
}

const ClientDetailsTab: React.FC<ClientDetailsTabProps> = ({ client }) => {
  return (
    <div className="flex flex-col gap-6 ">
      <div className="space-y-4">
        <h3 className="font-medium text-base text-gray-700">Company Mission</h3>
        <p className="text-base text-gray-600">{client.mission}</p>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium text-gray-700">Most Common Requests</h3>
        <div className="flex flex-wrap gap-2">
          {client.commonRequests.map((request: string, index: number) => (
            <CommonRequestBadge withIcon key={index} requestName={request} variant="outlined" />
          ))}
        </div>
      </div>


      
      <div className="space-y-4">
        <h3 className="font-medium text-gray-700">Current with {client.name}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div className="bg-green-bg-400 p-2 md:p-4 rounded-md">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg md:text-2xl font-bold">{client.currentStats.newTasks}</h4>
            </div>
            <div className="text-xs md:text-sm">New Tasks</div>
          </div>
          
          <div className="bg-orange-200 p-2 md:p-4 rounded-md">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg md:text-2xl font-bold">{client.currentStats.pending}</h4>
            </div>
            <div className="text-xs md:text-sm ">Pending Review</div>
          </div>
          
          <div className="bg-pale-green-500 p-2 md:p-4 rounded-md">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg md:text-2xl font-bold">{client.currentStats.completed}</h4>
            </div>
            <div className="text-xs md:text-sm ">Completed (Week)</div>
          </div>
          
          <div className="bg-red-red-100 p-2 md:p-4 rounded-md">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg md:text-2xl font-bold">{client.currentStats.credits}</h4>
            </div>
            <div className="text-xs md:text-sm ">Running Credits</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-700">Key Work Statistics</h3>
          <Dropdown 
            items={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' }
            ]}
            selectedValue="weekly"
            variant="outlineG"
            size="sm"
            className="border border-gray-200"
            showChevron={true}
          />
        </div>
        
        {/* Contenedor principal con borde */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
          <div className="grid grid-cols-2">
            {/* Columna izquierda */}
            <div className="space-y-2 p-4">
              <div className="flex justify-between pb-3">
                <span className="text-base ">Hours Logged</span>
                <span className="text-sm text-green-gray-800 font-medium">{client.stats.hoursLogged}</span>
              </div>
              <div className="flex justify-between pb-3">
                <span className="text-base ">Credit Consumption</span>
                <span className="text-sm text-green-gray-800 font-medium">{client.stats.credits}</span>
              </div>
              <div className="flex justify-between pb-3">
                <span className="text-base ">Time per Request</span>
                <span className="text-sm text-green-gray-800 font-medium">{client.stats.timePerRequest}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base ">Avg. Response Time</span>
                <span className="text-sm text-green-gray-800 font-medium">{client.stats.responseTime}</span>
              </div>
            </div>
            
            {/* Divisor vertical */}
            <div className="border-l border-gray-200">
              {/* Columna derecha */}
              <div className="space-y-2 p-4">
                <div className="flex justify-between pb-3">
                  <span className="text-base ">Task Volume</span>
                  <span className="text-sm text-green-gray-800 font-medium">{client.stats.taskVolume}</span>
                </div>
                <div className="flex justify-between pb-3">
                  <span className="text-base ">Revisions per Task</span>
                  <span className="text-sm text-green-gray-800 font-medium">{client.stats.revisionsPerTask}</span>
                </div>
                <div className="flex justify-between pb-3">
                  <span className="text-base">Avg. Client Rating</span>
                  <span className="text-sm text-green-gray-800 font-medium">{client.stats.rating}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base ">Last Session</span>
                  <span className="text-sm text-green-gray-800 font-medium">{client.stats.lastSession}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium text-gray-700">Common Phrases in Requests</h3>
        <div className="flex flex-wrap gap-2">
          {client.phrases.map((phrase: string, index: number) => (
            <CommonRequestBadge withIcon={false} key={index}
             requestName={phrase} variant="colored" size="md" />
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium text-gray-700">Favorite Bespire Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
          {client.favoriteMembers.map((member: any, index: number) => (
            <MemberCard 
              key={index}
              member={member}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsTab;
