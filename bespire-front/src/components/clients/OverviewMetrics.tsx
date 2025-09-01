"use client";

import { useState, useMemo } from "react";
import { overviewMetricsByPeriod } from "@/mocks/clients";
import TabSelector from "@/components/ui/TabSelector";
import MetricsGrid from "@/components/ui/MetricsGrid";
import { UpdatesCard } from "@/components/cards";
import People from "@/assets/icons/people.svg";
import Revision from "@/assets/icons/revision.svg";
import StarCircle from "@/assets/icons/star-circle.svg";
import Customize from "@/assets/icons/customize.svg";

export default function OverviewMetricsComponent() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedPlan, setSelectedPlan] = useState("plans");

  const periodItems = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ];

  // Obtener métricas dinámicas basadas en el período seleccionado
  const currentMetrics = useMemo(() => {
    return overviewMetricsByPeriod[selectedPeriod as keyof typeof overviewMetricsByPeriod];
  }, [selectedPeriod]);

  // Preparar datos para MetricsGrid con métricas dinámicas
  const metricsData = useMemo(() => [
    {
      id: "active-clients",
      title: "Active Clients",
      value: currentMetrics.activeClients.count,
      percentage: currentMetrics.activeClients.percentage,
      description: currentMetrics.activeClients.description,
      icon: People,
      trend: "up" as const,
      trendColor: "green" as const,
    },
    {
      id: "revision-rate",
      title: "Revision Rate",
      value: currentMetrics.revisionRate.rate,
      percentage: currentMetrics.revisionRate.percentage,
      description: currentMetrics.revisionRate.description,
      icon: Revision,
      trend: "down" as const,
      trendColor: "red" as const,
    },
    {
      id: "overall-rating",
      title: "Overall Client Ratings",
      value: currentMetrics.overallRating.rating,
      percentage: currentMetrics.overallRating.percentage,
      description: currentMetrics.overallRating.description,
      icon: StarCircle,
      trend: "up" as const,
      trendColor: "green" as const,
    },
    {
      id: "task-volume",
      title: "Task Volume",
      value: currentMetrics.taskVolume.count,
      percentage: currentMetrics.taskVolume.percentage,
      description: currentMetrics.taskVolume.description,
      icon: Customize,
      trend: "down" as const,
      trendColor: "red" as const,
    },
  ], [currentMetrics]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-gray-900">Overview Metrics</h2>
        <div className="flex space-x-2">
          <TabSelector
            items={periodItems}
            selectedValue={selectedPeriod}
            onChange={setSelectedPeriod}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[35%_1fr] items-center gap-4">
        {/* Updates Card - 35% width */}
        <UpdatesCard
          data={currentMetrics.updates}
          selectedPlan={selectedPlan}
          onPlanChange={setSelectedPlan}
        />

        {/* Metrics Grid - 65% width */}
        <MetricsGrid
          metrics={metricsData}
          columns="grid-cols-1 md:grid-cols-2"
          className=""
          cardClassName="bg-white  "
        />
      </div>
    </div>
  );
}
