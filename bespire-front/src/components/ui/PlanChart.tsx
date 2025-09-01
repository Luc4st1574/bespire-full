"use client";

interface PlanData {
    name: string;
    value: number;
    color: string;
}

interface PlanChartProps {
    data: PlanData[];
    height?: string;
    className?: string;
    showLabels?: boolean;
    labelClassName?: string;
}

const PlanChart: React.FC<PlanChartProps> = ({
    data,
    height = "h-4",
    className = "",
    showLabels = true,
    labelClassName = "text-xs text-gray-600"
}) => {
    // Calcular el total
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // Calcular porcentajes y asegurar que sumen 100%
    const dataWithPercentages = data.map(item => ({
        ...item,
        percentage: total > 0 ? (item.value / total) * 100 : 0
    }));

    // Asegurar que los porcentajes sumen exactamente 100%
    const totalPercentage = dataWithPercentages.reduce((sum, item) => sum + item.percentage, 0);
    if (totalPercentage > 0 && totalPercentage !== 100) {
        const adjustment = 100 / totalPercentage;
        dataWithPercentages.forEach(item => {
            item.percentage *= adjustment;
        });
    }

    return (
        <div className={className}>
            {/* Barra de progreso */}
            <div className={`flex space-x-1 mb-2 ${height}`}>
                {dataWithPercentages.map((item, index) => {
                    // Solo mostrar si tiene un porcentaje significativo (> 0.5%)
                    if (item.percentage < 0.5) return null;
                    
                    return (
                        <div
                            key={`${item.name}-${index}`}
                            className={`${item.color} rounded transition-all duration-300 hover:opacity-80`}
                            style={{ 
                                width: `${item.percentage}%`,
                                minWidth: item.percentage > 0 ? '8px' : '0px' // Mínimo ancho visible
                            }}
                            title={`${item.name}: ${item.value} (${item.percentage.toFixed(1)}%)`}
                        />
                    );
                })}
            </div>

            {/* Etiquetas */}
            {showLabels && (
                <div className="flex justify-between">
                    {dataWithPercentages.map((item, index) => {
                        // Solo mostrar etiquetas para items significativos
                        if (item.percentage < 0.5) return null;
                        
                        return (
                            <span 
                                key={`label-${item.name}-${index}`}
                                className={labelClassName}
                                title={`${item.value} clients`}
                            >
                                {item.name}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PlanChart;
