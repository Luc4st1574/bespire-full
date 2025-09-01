import React from 'react';
import Star from "@/assets/icons/reviews/star.svg";

interface StarRatingProps {
  rating: number;
  showText?: boolean;
  textSuffix?: string;
  className?: string;
  starClassName?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  showText = true,
  textSuffix = "Stars",
  className = "",
  starClassName = "",
  textClassName = "",
  size = "md"
}) => {
  // Tamaños predefinidos
  const sizeClasses = {
    sm: {
      star: "w-3 h-3",
      text: "text-xs"
    },
    md: {
      star: "w-4 h-4", 
      text: "text-sm"
    },
    lg: {
      star: "w-5 h-5",
      text: "text-base"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center ${className}`}>
      <Star 
        className={`text-[#697D67] mr-1 ${currentSize.star} ${starClassName}`} 
      />
      {showText && (
        <span className={`font-medium text-[#62864D] ${currentSize.text} ${textClassName}`}>
          {rating} {textSuffix}
        </span>
      )}
    </div>
  );
};

export default StarRating;
