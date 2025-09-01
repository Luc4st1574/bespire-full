// components/PriorityBadge.tsx
import React from "react";
import PriorityDropdown from "./PriorityDropdown";
import PriorityUI, { type Priority } from "./PriorityUI";

interface Props {
  requestId: string;
  priority: Priority;
  editable?: boolean;
  disabled?: boolean;
}

export default function PriorityBadge({
  requestId,
  priority,
  editable = false,
  disabled = false,
}: Props) {
  // Si es editable, usar el dropdown
  if (editable) {
    return (
      <PriorityDropdown
        requestId={requestId}
        currentPriority={priority}
        disabled={disabled}
      />
    );
  }

  // Si no es editable, mostrar solo el badge estático usando PriorityUI
  return <PriorityUI priority={priority} />;
}
