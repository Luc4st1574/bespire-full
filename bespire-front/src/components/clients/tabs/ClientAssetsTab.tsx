import React from 'react';

interface ClientAssetsTabProps {
  client: any; // En una implementación real, usaríamos un tipo más específico
}

const ClientAssetsTab: React.FC<ClientAssetsTabProps> = ({ client }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Spherule Brands</h2>
        <button className="border rounded-full px-3 py-1 text-sm flex items-center gap-1">
          Add <span>+</span>
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex flex-col gap-2 items-center">
            <div className="text-2xl font-bold">Spherule</div>
            <button className="mt-2">→</button>
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex flex-col gap-2 items-center">
            <div className="text-2xl font-bold text-orange-500">Waymax</div>
            <button className="mt-2">→</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientAssetsTab;
