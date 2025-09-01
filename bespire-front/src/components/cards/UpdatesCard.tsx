/* eslint-disable @next/next/no-img-element */
"use client";

import Dropdown from "@/components/ui/Dropdown";
import PlanChart from "@/components/ui/PlanChart";

interface PlanBreakdown {
    starter: number;
    growth: number;
    pro: number;
    custom: number;
}

interface UpdatesData {
    title: string;
    subtitle: string;
    description: string;
    planBreakdown: PlanBreakdown;
}

interface UpdatesCardProps {
    data: UpdatesData;
    selectedPlan: string;
    onPlanChange: (value: string) => void;
    className?: string;
}

const UpdatesCard: React.FC<UpdatesCardProps> = ({
    data,
    selectedPlan,
    onPlanChange,
    className = ""
}) => {
    const planItems = [
        { value: "plans", label: "Plans" },
        { value: "starter", label: "Starter" },
        { value: "growth", label: "Growth" },
        { value: "pro", label: "Pro" },
        { value: "custom", label: "Custom" }
    ];

    // Preparar datos para PlanChart basados en el plan seleccionado
    const getPlanChartData = () => {
        const baseData = [
            {
                name: "Starter",
                value: data.planBreakdown.starter,
                color: "bg-blue-500",
                originalValue: data.planBreakdown.starter
            },
            {
                name: "Growth", 
                value: data.planBreakdown.growth,
                color: "bg-[#004049]",
                originalValue: data.planBreakdown.growth
            },
            {
                name: "Pro",
                value: data.planBreakdown.pro,
                color: "bg-yellow-500",
                originalValue: data.planBreakdown.pro
            },
            {
                name: "Custom",
                value: data.planBreakdown.custom,
                color: "bg-gray-500",
                originalValue: data.planBreakdown.custom
            }
        ];

        // Si se seleccionó un plan específico, destacar solo ese plan
        if (selectedPlan.toLowerCase() !== "plans") {
            return baseData.map(plan => ({
                ...plan,
                value: plan.name.toLowerCase() === selectedPlan.toLowerCase() 
                    ? plan.originalValue 
                    : Math.max(1, Math.floor(plan.originalValue * 0.2)), // Reducir otros planes pero mantener visibilidad
                color: plan.name.toLowerCase() === selectedPlan.toLowerCase() 
                    ? plan.color 
                    : plan.color.replace('bg-', 'bg-opacity-30 bg-') // Hacer más tenues los no seleccionados
            }));
        }

        return baseData;
    };

    // Generar descripción dinámica basada en el plan seleccionado
    const getDynamicDescription = () => {
        const planData = data.planBreakdown;
        
        switch (selectedPlan.toLowerCase()) {
            case "starter":
                return `${planData.starter} clients on Starter plan this period`;
            case "growth":
                return `${planData.growth} clients on Growth plan this period`;
            case "pro":
                return `${planData.pro} clients on Pro plan this period`;
            case "custom":
                return `${planData.custom} clients on Custom plan this period`;
            default:
                return data.description; // Descripción original
        }
    };

    const planChartData = getPlanChartData();

    return (
        <div className={`relative bg-green-gradient rounded-xl p-6 overflow-hidden shadow-updates ${className} min-h-[280px]`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <img src="/assets/icons/asterisk-circle.svg" alt="" />
                    <h3 className="font-medium text-xl">
                        {data.title}
                    </h3>
                </div>
                <Dropdown
                    items={planItems}
                    selectedValue={selectedPlan.toLowerCase()}
                    placeholder="Plans"
                    variant="greenBP"
                    size="md"
                    onChange={onPlanChange}
                />
            </div>
            
            <p className="text-lg text-gray-600 mb-2">
                {data.subtitle}
            </p>
            
            <p className="text-3xl font-medium mb-4 text-gray-900">
                {getDynamicDescription()}
            </p>

            {/* Plan Chart Component */}
            <PlanChart 
                data={planChartData}
                height="h-4"
                className="mb-2"
                showLabels={true}
                labelClassName="text-xs text-gray-600"
            />
        </div>
    );
};

export default UpdatesCard;
