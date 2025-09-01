/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";

interface MetricData {
  id: string;
  title: string;
  value: string | number;
  percentage: string;
  description: string;
  icon: string | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend: "up" | "down" | "neutral";
  trendColor?: "green" | "red" | "gray";
}

interface MetricsGridProps {
  metrics: MetricData[];
  columns?: string;
  className?: string;
  cardClassName?: string;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  columns = "grid-cols-1 md:grid-cols-2",
  className = "",
  cardClassName = "",
}) => {
  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <img src="/assets/icons/trend_icon-up.svg" alt="Uptrend" />;
      case "down":
        return <img src="/assets/icons/trend_icon-down.svg" alt="Downtrend" />;
      case "neutral":
        return <img src="/assets/icons/trend_icon-neutral.svg" alt="Neutral" />;
      default:
        return "→";
    }
  };

  const getTrendColorClass = (trendColor?: "green" | "red" | "gray") => {
    switch (trendColor) {
      case "green":
        return "text-green-600";
      case "red":
        return "text-red-600";
      case "gray":
      default:
        return "text-gray-600";
    }
  };

  const getTrendBackgroundClass = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "bg-[#F3FEE7]";
      case "down":
        return "bg-[#FFE8E8]";
      case "neutral":
      default:
        return "bg-gray-100";
    }
  };

  const getIconComponent = (
    iconType: string | React.ComponentType<React.SVGProps<SVGSVGElement>>
  ) => {
    // Si es un componente SVG, renderizarlo con el color específico
    if (typeof iconType !== "string") {
      const IconComponent = iconType;
      return <IconComponent className="w-8 h-8" style={{ color: "#697D67" }} />;
    }

    // Mapa de iconos disponibles (fallback para strings)
    const iconMap: { [key: string]: string } = {
      users: "👥",
      refresh: "🔄",
      star: "⭐",
      chart: "📊",
      target: "🎯",
      time: "⏰",
      trending: "📈",
      money: "💰",
      bell: "🔔",
      heart: "❤️",
    };

    return iconMap[iconType] || iconType;
  };

  return (
    <div
      className={`bg-white rounded-xl border border-[#E2E6E4] overflow-hidden ${className}`}
    >
      <div
        className={`grid ${columns} rounded-xl divide-x divide-gray-200`}
      >
        {metrics.map((metric, index) => (
          <div
            key={metric.id}
            className={`p-6 ${cardClassName} flex justify-start items-start gap-2 ${
              index < 2 ? 'border-b border-gray-200' : ''
            }`}
          >
            <span className="w-[40px]">{getIconComponent(metric.icon)}</span>
            <div className="flex flex-col mb-2">
              <span className="text-lg text-[#697D67] font-medium">
                {metric.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-medium text-gray-900">
                  {metric.value}
                </span>
                <span
                  className={`ml-2 text-sm font-medium px-2 py-1 flex items-center gap-2 
                    rounded-md ${getTrendBackgroundClass(metric.trend)} `}
                >
                  <span>{metric.percentage}</span> {getTrendIcon(metric.trend)}
                </span>
              </div>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsGrid;
