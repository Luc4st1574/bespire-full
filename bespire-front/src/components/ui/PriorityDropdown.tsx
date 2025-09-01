import { useState } from 'react';
import { Menu } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { useRequestPriority } from '@/hooks/useRequestPriority';
import { showErrorToast, showSuccessToast } from './toast';
import PriorityUI, { type Priority } from './PriorityUI';

interface PriorityDropdownProps {
  requestId: string;
  currentPriority: Priority;
  disabled?: boolean;
}

export default function PriorityDropdown({ 
  requestId, 
  currentPriority, 
  disabled = false 
}: PriorityDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updatePriority } = useRequestPriority();

  // Todas las opciones de prioridad
  const allPriorities: Priority[] = ["high", "medium", "low", "none"];
  
  // Opciones disponibles (excluyendo la actual)
  const availableOptions = allPriorities.filter(p => p !== currentPriority);

  const handlePriorityChange = async (newPriority: Priority) => {
    if (newPriority === currentPriority || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await updatePriority(requestId, newPriority);
      showSuccessToast('Priority updated successfully!');
    } catch {
      showErrorToast('Failed to update priority');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open: menuOpen }) => (
        <>
          {/* Botón principal - usa PriorityUI con el ícono */}
          <Menu.Button
            disabled={disabled || isUpdating}
            className={`
              ${disabled || isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}
              transition-all duration-200
            `}
          >
            <PriorityUI priority={currentPriority}>
              {!disabled && (
                <ChevronDown 
                  className={`w-3 h-3 ml-2 transition-transform duration-200 ${
                    menuOpen ? 'rotate-180' : ''
                  }`} 
                />
              )}
            </PriorityUI>
          </Menu.Button>

          {/* Dropdown menu */}
          {!disabled && (
            <Menu.Items className="absolute left-0 z-20 mt-1 w-24 p-2 origin-top-left rounded-lg bg-white ring-1 ring-[#E2E6E4] ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {availableOptions.map((priority) => (
                  <Menu.Item key={priority}>
                    {({ active }) => (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handlePriorityChange(priority)}
                        className={`
                          w-full 
                          ${active ? ' ring-opacity-50' : ''}
                          ${isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                          transition-all duration-150
                        `}
                      >
                        <PriorityUI priority={priority} className="w-full" />
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          )}
        </>
      )}
    </Menu>
  );
}