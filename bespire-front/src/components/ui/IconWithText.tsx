import React, { ReactNode } from 'react';

interface IconWithTextProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  vertical?: boolean; // Si queremos alineación vertical u horizontal
  className?: string;
  titleLabel?: string; // Para casos como "Contract Start: valor"
  isRaw?: boolean; // Para cuando queremos renderizar HTML bruto (por ejemplo, con <br>)
}

const IconWithText: React.FC<IconWithTextProps> = ({ 
  icon, 
  title, 
  subtitle, 
  vertical = false,
  className = '',
  titleLabel,
  isRaw = false
}) => {
  return (
    <div className={`flex items-${vertical ? 'start ' : 'center'} gap-3 ${className}`}>
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col">
        {isRaw ? (
          <div className="text-sm">
            {titleLabel && <>{titleLabel}:<br /></>}
            {title}
          </div>
        ) : (
          <>
            <span className="text-sm font-medium">
              {titleLabel ? `${titleLabel}: ${title}` : title}
            </span>
            {subtitle && <span className="text-xs text-gray-500 block">{subtitle}</span>}
          </>
        )}
      </div>
    </div>
  );
};

export default IconWithText;
