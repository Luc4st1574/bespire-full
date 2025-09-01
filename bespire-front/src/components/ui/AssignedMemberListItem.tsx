/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// components/AssignedMemberListItem.tsx
import { TEAM_ROLE_LABELS } from "@/constants/teamRoles";
import { getInitials } from "@/utils/utils";
import React from "react";

type User = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  teamRole?: string;
};

interface Props {
  user: User;
  onClick?: () => void;
}

export default function AssignedMemberListItem({ user, onClick }: Props) {
  console.log("AssignedMemberListItem rendered with user:", user);
  const initials = getInitials(user.name);

  return (
    <li
      className="flex px-2 items-start gap-2 justify-start py-1 hover:bg-gray-100 rounded cursor-pointer"
      onClick={() => onClick?.()}
    >
      <div className="flex items-center gap-2">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full mr-1 object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 mr-3 text-gray-600 flex items-center justify-center font-semibold text-base">
            {initials}
          </div>
        )}
        <div>
          <div className="font-medium text-gray-900 text-md">{user.name}</div>
          <div className="text-xs text-gray-500">
            {TEAM_ROLE_LABELS[(user as any).teamRole] || (user as any).title || (user as any).email}
          </div>
        </div>
      </div>
    </li>
  );
}
