import React, { useState } from 'react';
import Dropdown from '@/components/ui/Dropdown';
import TabSelector, { TabItem } from '@/components/ui/TabSelector';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ComposedChart,
  Line
} from 'recharts';
import { 
  taskDistributionByPeriod, 
  projectRatingsByPeriod, 
  taskCategoriesByPeriod 
} from '@/mocks/metricsData';

interface ClientMetricsTabProps {
  client: any; // En una implementación real, usaríamos un tipo más específico
}

const ClientMetricsTab: React.FC<ClientMetricsTabProps> = ({ client }) => {
  const [activeTimeTab, setActiveTimeTab] = useState('week');
  const [taskDistributionFilter, setTaskDistributionFilter] = useState('volume');
  const [projectRatingsFilter, setProjectRatingsFilter] = useState('all');
  const [taskCategoriesFilter, setTaskCategoriesFilter] = useState('all');

  // Configuración de tabs para el período de tiempo usando TabSelector
  const timePeriodTabs: TabItem[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];

  // Obtener datos dinámicos basados en los filtros seleccionados
  const getCurrentTaskDistributionData = () => {
    const periodData = taskDistributionByPeriod[activeTimeTab as keyof typeof taskDistributionByPeriod];
    return periodData[taskDistributionFilter as keyof typeof periodData] || [];
  };

  const getCurrentProjectRatingsData = () => {
    return projectRatingsByPeriod[projectRatingsFilter as keyof typeof projectRatingsByPeriod] || [];
  };

  const getCurrentTaskCategoriesData = () => {
    return taskCategoriesByPeriod[taskCategoriesFilter as keyof typeof taskCategoriesByPeriod] || [];
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Performance Metrics Section */}
      <div className="space-y-4">
       <div className='flex flex-col items-center gap-4'>
         <h2 className="font-semibold text-lg">Performance Metrics</h2>
        
        {/* Time Period Tabs */}
        <TabSelector
          items={timePeriodTabs}
          selectedValue={activeTimeTab}
          onChange={setActiveTimeTab}
         
        />
       </div>

        {/* Task Distribution Chart */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700">Task Distribution</h3>
            <Dropdown
              items={[
                { value: 'volume', label: 'Volume' },
                { value: 'hours', label: 'Hours' },
                { value: 'percentage', label: 'Percentage' }
              ]}
              selectedValue={taskDistributionFilter}
              onChange={setTaskDistributionFilter}
              variant="outlineG"
              size="sm"
              showChevron={true}
            />
          </div>
          
          {/* Gráfico de Barras Apiladas para la Distribución de Tareas */}
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getCurrentTaskDistributionData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="New Task" stackId="a" fill="#5B6F59" />
                <Bar dataKey="Revision" stackId="a" fill="#CEFFA3" />
                <Bar dataKey="Meetings" stackId="a" fill="#E0E5DA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Leyenda */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#4C5652] rounded"></div>
              <span>New Task</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#CEFFA3] rounded"></div>
              <span>Revision</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#E3E9DE] rounded"></div>
              <span>Meetings</span>
            </div>
            <div className="ml-auto">
              <button className="text-gray-600 hover:text-gray-800 text-sm">
                View all →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Ratings Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-700">Project Ratings</h3>
          <Dropdown
            items={[
              { value: 'all', label: 'All' },
              { value: 'last-month', label: 'Last Month' },
              { value: 'last-quarter', label: 'Last Quarter' }
            ]}
            selectedValue={projectRatingsFilter}
            onChange={setProjectRatingsFilter}
            variant="outlineG"
            size="sm"
            showChevron={true}
          />
        </div>
        
        {/* Gráfico de Barras Verticales para Ratings de Proyecto */}
        <div className="h-80 mb-4 relative">
          {/* Grid de fondo */}
          <div className="absolute inset-0 flex flex-col justify-between py-5 px-8">
            {[5, 4, 3, 2, 1, 0].map((num) => (
              <div key={num} className="border-b border-gray-200 flex items-center">
                <span className="text-xs text-gray-500 w-4">{num}</span>
              </div>
            ))}
          </div>
          
          {/* Gráfico personalizado */}
          <div className="absolute inset-0 py-5 px-8">
            <div className="h-full flex items-end justify-between relative">
              {/* Contenedor para las barras */}
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end" style={{ height: '200px' }}>
                {getCurrentProjectRatingsData().map((item, index) => {
                  const rangeHeight = ((item.rangeMax - item.rangeMin) / 5) * 200;
                  const bottomOffset = (item.rangeMin / 5) * 200;
                  const averageFromBottom = (item.average / 5) * 200;
                  
                  return (
                    <div key={index} className="flex flex-col items-center relative">
                      {/* Barra de rango */}
                      <div 
                        className="w-6 bg-[#5B6F59] rounded-full relative"
                        style={{ 
                          height: `${rangeHeight}px`,
                          marginBottom: `${bottomOffset}px`
                        }}
                      >
                        {/* Punto de promedio centrado horizontalmente */}
                        <div 
                          className="absolute w-3 h-3 bg-white border-2 border-[#5B6F59] rounded-full"
                          style={{ 
                            bottom: `${averageFromBottom - bottomOffset}px`,
                            left: '50%',
                            transform: 'translateX(-50%)'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Etiquetas de fecha alineadas abajo */}
              <div className="absolute bottom-0 left-8 right-8 flex justify-between">
                {getCurrentProjectRatingsData().map((item, index) => (
                  <div key={index} className="flex justify-center w-6">
                    <span className="text-xs text-gray-600">
                      {item.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Leyenda */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#4C5652] rounded-full"></div>
            <span>Range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#E3E9DE] rounded"></div>
            <span>Average</span>
          </div>
          <div className="ml-auto">
            <button className="text-gray-600 hover:text-gray-800 text-sm">
              View all →
            </button>
          </div>
        </div>
      </div>

      {/* Task Distribution Pie Chart */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-700">Task Distribution</h3>
          <Dropdown
            items={[
              { value: 'all', label: 'All' },
              { value: 'last-week', label: 'Last Week' },
              { value: 'last-month', label: 'Last Month' }
            ]}
            selectedValue={taskCategoriesFilter}
            onChange={setTaskCategoriesFilter}
            variant="outlineG"
            size="sm"
            showChevron={true}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Dona para la Distribución de Tareas */}
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={getCurrentTaskCategoriesData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  stroke="none"
                  startAngle={90}
                  endAngle={450}
                  paddingAngle={8}
                  cornerRadius={10}
                >
                  {getCurrentTaskCategoriesData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value}`, name]}
                  labelStyle={{ display: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Lista de categorías con barras de progreso */}
          <div className="space-y-4">
            {getCurrentTaskCategoriesData().map((entry, index) => {
              const total = getCurrentTaskCategoriesData().reduce((sum, item) => sum + item.value, 0);
              const percentage = (entry.value / total) * 100;
              
              return (
                <div key={`category-${index}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{entry.value}</span>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        backgroundColor: entry.color,
                        width: `${percentage}%`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-6 text-right">
          <button className="text-gray-600 hover:text-gray-800 text-sm">
            View all →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientMetricsTab;
