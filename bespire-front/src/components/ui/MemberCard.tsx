import React from 'react';
import StarRating from './StarRating';
import CommonRequestBadge from './CommonRequestBadge';

interface MemberCardProps {
  member: {
    name: string;
    role: string;
    rating: number;
    skills: string[];
    avatarUrl?: string | null; // URL del avatar personalizado (opcional)
  };
  className?: string;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, className = "" }) => {
  // Determinar la URL del avatar a usar
  const getAvatarUrl = () => {
    // Si hay avatarUrl y no está vacío, usarlo
    if (member.avatarUrl && member.avatarUrl.trim() !== '') {
      return member.avatarUrl;
    }
    
    // Fallback a ui-avatars.com - tamaño actualizado a 80px para w-20
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=e5e7eb&color=374151&size=80`;
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-2 md:p-4 ${className}`}>
      <div className="flex flex-col items-center text-center gap-1 ">
        {/* Avatar */}
        <div className="w-[100px] h-[100px]  rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={getAvatarUrl()}
            alt={member.name} 
            className="h-full w-full object-cover"
            onError={(e) => {
              // Si falla cargar la imagen personalizada, usar el fallback
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=e5e7eb&color=374151&size=80`;
            }}
          />
        </div>
        
        {/* Member Info */}
        <h4 className="font-medium text-base">{member.name}</h4>
        <p className="text-xs text-green-gray-500">{member.role}</p>
        
        {/* Rating */}
       <StarRating rating={member.rating} />
        
        {/* Skills */}
        <div className="flex flex-wrap gap-1 justify-center">
          {member.skills.map((skill: string, idx: number) => (
             <CommonRequestBadge withIcon={false} key={idx}
             requestName={skill} variant="colored" size="md" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
