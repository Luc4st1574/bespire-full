import React from "react";
import {
  getRequestTypeWithFallback,
  CommonRequestType,
} from "@/config/commonRequestTypes";

interface CommonRequestBadgeProps {
  requestName: string;
  className?: string;
  variant?: "default" | "colored" | "outlined";
  size?: "sm" | "md" | "lg";
  withIcon?: boolean;
}

const CommonRequestBadge: React.FC<CommonRequestBadgeProps> = ({
  requestName,
  className = "",
  variant = "default",
  size = "md",
  withIcon = true,
}) => {
  const requestType: CommonRequestType =
    getRequestTypeWithFallback(requestName);

  // Estilos base según el tamaño
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  // Estilos según la variante
  const getVariantStyles = () => {
    switch (variant) {
      case "default":
        return {
          className: "border border-gray-200",
          style: { backgroundColor: "#f3f4f6" } // gray-100
        };
      case "colored":
        return {
          className: "",
          style: { backgroundColor: getCategoryColor(requestType.category) }
        };
      case "outlined":
        return {
          className: "bg-transparent border border-[#3F4744] hover:bg-gray-50",
          style: {}
        };
      default:
        return {
          className: "border border-gray-200",
          style: { backgroundColor: "#f3f4f6" }
        };
    }
  };

  // Tamaño del emoji según el tamaño del badge
  const emojiSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const variantStyles = getVariantStyles();

  return (
    <span
      className={`inline-flex items-center gap-2 text-[#3F4744] rounded-full font-medium transition-colors ${sizeClasses[size]} ${variantStyles.className} ${className}`}
      style={variantStyles.style}
      title={`Category: ${requestType.category}`}
    >
      {withIcon && <span className={emojiSize[size]}>{requestType.icon}</span>}
      <span>{requestType.name}</span>
    </span>
  );
};

// Función helper para obtener colores por categoría
function getCategoryColor(category?: string): string {
  switch (category) {
    case "Design":
      return "#FEEDCF";
    case "UI/UX":
      return "#FEEDCF";
    case "Marketing":
      return "#F3FEE7";
    case "Branding":
      return "#DEFCBD";
    case "Print Design":
      return "#DEFCBD";
    case "Blog Design":
      return "#F0F3F4";
    default:
      return "#f3f4f6"; // gray-100
  }
}

export default CommonRequestBadge;