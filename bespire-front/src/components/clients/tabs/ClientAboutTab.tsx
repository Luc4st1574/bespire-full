import React, { useState, useEffect, useCallback } from 'react';
import CompanyAvatarUploader from '@/utils/CompanyAvatarUploader';

interface ClientData {
  id?: string;
  name: string;
  logo?: string;
  website?: string;
  phone?: string;
  email: string;
  industry?: string;
  size?: string;
  location?: string;
  brandArchetype?: string;
  communicationStyle?: string;
  elevatorPitch?: string;
  mission?: string;
  vision?: string;
  valueProposition?: string;
}

interface ClientAboutTabProps {
  client: ClientData;
  onSave?: (updatedClient: ClientData) => void; // Callback para guardar los cambios
}

const ClientAboutTab: React.FC<ClientAboutTabProps> = ({ client, onSave }) => {
  const [formData, setFormData] = useState<ClientData>(client);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Función para guardar con debounce
  const debouncedSave = useCallback((data: ClientData) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(() => {
      setSaveStatus('saving');
      
      // Simular guardado (aquí iría la llamada a la API)
      setTimeout(() => {
        if (onSave) {
          onSave(data);
        }
        setSaveStatus('saved');
        
        // Limpiar el estado después de mostrar "saved"
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }, 500);
    }, 1000); // Esperar 1 segundo después de dejar de escribir

    setSaveTimeout(timeout);
  }, [saveTimeout, onSave]);

  // Manejar cambios en los campos
  const handleFieldChange = (field: keyof ClientData, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    debouncedSave(updatedData);
  };

  // Guardar al perder el foco
  const handleBlur = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      setSaveTimeout(null);
    }
    
    setSaveStatus('saving');
    setTimeout(() => {
      if (onSave) {
        onSave(formData);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 300);
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  // Componente para mostrar el estado de guardado
  const SaveStatusIndicator = () => {
    if (saveStatus === 'idle') return null;
    
    const statusConfig = {
      saving: { text: 'Saving...', color: 'text-blue-500' },
      saved: { text: 'Saved', color: 'text-green-500' },
      error: { text: 'Error saving', color: 'text-red-500' }
    };
    
    const config = statusConfig[saveStatus];
    
    return (
      <div className={`text-sm ${config.color} flex items-center gap-1`}>
        {saveStatus === 'saving' && (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
        )}
        {saveStatus === 'saved' && <span>✓</span>}
        {saveStatus === 'error' && <span>⚠</span>}
        {config.text}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
        <div className='flex justify-end '>
            <SaveStatusIndicator />
        </div>
      {/* Header with save status */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-4">
          <CompanyAvatarUploader
            avatarUrl={formData.logo || ""}
            setAvatarUrl={(url) => handleFieldChange('logo', url)}
            showLabel={false}
            centered={true}
          />
          <div>
            <h2 className="text-xl font-semibold">{formData.name}</h2>
          </div>
        </div>
        
      </div>
      
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Website</label>
          <input 
            type="text" 
            value={formData.website} 
            onChange={(e) => handleFieldChange('website', e.target.value)}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
          <input 
            type="text" 
            value={formData.phone || ""} 
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            value={formData.email} 
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Industry</label>
          <select
            value={formData.industry || ""}
            onChange={(e) => handleFieldChange('industry', e.target.value)}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Industry</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Education">Education</option>
            <option value="Retail">Retail</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
          <select
            value={formData.size || ""}
            onChange={(e) => handleFieldChange('size', e.target.value)}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501+">501+ employees</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input 
            type="text" 
            value={formData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand Archetype</label>
          <select
            value={formData.brandArchetype || ""}
            onChange={(e) => handleFieldChange('brandArchetype', e.target.value)}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Archetype</option>
            <option value="The Innocent">The Innocent</option>
            <option value="The Explorer">The Explorer</option>
            <option value="The Sage">The Sage</option>
            <option value="The Hero">The Hero</option>
            <option value="The Outlaw">The Outlaw</option>
            <option value="The Magician">The Magician</option>
            <option value="The Regular Guy">The Regular Guy</option>
            <option value="The Lover">The Lover</option>
            <option value="The Jester">The Jester</option>
            <option value="The Caregiver">The Caregiver</option>
            <option value="The Creator">The Creator</option>
            <option value="The Ruler">The Ruler</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Communication Style</label>
          <textarea 
            value={formData.communicationStyle || ""} 
            onChange={(e) => handleFieldChange('communicationStyle', e.target.value)}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded-md p-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Describe the preferred communication style..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Elevator Pitch</label>
          <textarea 
            value={formData.elevatorPitch || ""} 
            onChange={(e) => handleFieldChange('elevatorPitch', e.target.value)}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded-md p-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Brief elevator pitch..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mission</label>
          <textarea 
            value={formData.mission || ""} 
            onChange={(e) => handleFieldChange('mission', e.target.value)}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded-md p-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Company mission statement..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vision</label>
          <textarea 
            value={formData.vision || ""} 
            onChange={(e) => handleFieldChange('vision', e.target.value)}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded-md p-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Company vision statement..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Value Proposition(s)</label>
          <textarea 
            value={formData.valueProposition || ""} 
            onChange={(e) => handleFieldChange('valueProposition', e.target.value)}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded-md p-2 h-36 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Key value propositions..."
          />
        </div>
      </div>
    </div>
  );
};

export default ClientAboutTab;
