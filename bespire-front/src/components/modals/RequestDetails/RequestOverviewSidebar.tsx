/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import AssignedMemberListItem from "../../ui/AssignedMemberListItem";
import PriorityBadge from "../../ui/PriorityBadge";
import CustomDatePicker from "../../ui/CustomDatePicker";
import TimeSpentInput from "../../ui/TimeSpentInput";
import { useMembersBespire } from "@/hooks/useMembersBespire";
import AssigneesSection from "../../requests/AssigneesSection";
import { getInitials, isAdminLike } from "@/utils/utils";
import { useAppContext } from "@/context/AppContext";
import { useRequestDetail } from "@/hooks/useRequestDetail";
import { useRequestContext } from "@/context/RequestContext";

type RequestOverviewSidebarProps = {
  request: any; // Replace 'any' with the actual type if available
  onBackToMain: () => void;
};

export default function RequestOverviewSidebar({ request, onBackToMain }: RequestOverviewSidebarProps) {
  const { role } = useAppContext();
  const roleuser = role || "client"; // Default to 'client' if role is undefined
  const { updateFields, loadingUpdate } = useRequestDetail(request.id);
  const isAdmin = isAdminLike(roleuser);
    const { isBlocked } = useRequestContext();
  const requestType = {
    main: request.typeMain || "Branding",
    sub: request.typeSub || "Logo",
  };
  console.log("Request Overview Sidebar", request);
  const { members } = useMembersBespire({ linkedToId: request.id });
  console.log("Members in Request Overview Sidebar:", members);
  const isSubtask = !!request.parentRequest;

  function handleInternalDueDateChange(newDate: Date) {
    console.log("Updating internal due date to:", newDate);
    updateFields({ internalDueDate: newDate });
  }

  return (
    <aside className="w-70 min-w-[260px] p-6 border-r border-[#E2E6E4] flex flex-col gap-2 overflow-y-auto">
      {/* ---- Botón Back to Main Task si es subtask ---- */}
      {isSubtask && (
        <button
          className="flex items-center gap-2 font-medium cursor-pointer "
          onClick={onBackToMain}
        >
          <img src="/assets/icons/menorq.svg" alt="" />
          <span>Back to Main Task</span>
        </button>
      )}
      <h1 className="font-medium text-xl">Overview</h1>
      {/* Priority */}
      <div className="flex flex-col items-start gap-2">
        <div className="text-base text-[#5E6B66]">Priority</div>
        <PriorityBadge
          requestId={request.id}
          priority={request.priority}
          editable={true}
          disabled={isBlocked} // Del contexto que ya tienes
        />
      </div>
      {/* Client */}
      <div className="flex flex-col items-start gap-2">
        <div className="text-base text-[#5E6B66]">Client</div>
        <div className="flex items-center gap-2">
          {request.client.avatar ? (
            <img
              src={request.client.avatar}
              alt={request.client.name}
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              {getInitials(request.client.name)}
            </div>
          )}
          <span className="font-medium">{request.client.name}</span>
        </div>
      </div>
      {/* Requester */}
      <div className="flex flex-col items-start gap-2">
        <div className="text-base text-[#5E6B66]">Requester</div>

        <ul>
          <AssignedMemberListItem
            key={request.requester.id}
            user={request.requester}
          />
        </ul>
      </div>
      {/* Assignees */}
      <AssigneesSection linkedToId={request.id} teamMembers={members} />
      {/* Created & Due Date */}
      <div className="flex flex-col ">
        <div className="text-base text-[#5E6B66]">Created</div>
        <div className="flex items-center ">
          <CustomDatePicker
            value={request.createdAt}
            onChange={() => {}}
            disabled={true} // O true si solo visualizar
          />
        </div>
        <div className="text-base text-[#5E6B66] ">Due Date</div>
        <CustomDatePicker
          value={
            ["admin", "success_manager", "client"].includes(roleuser)
              ? request.dueDate
              : request.internalDueDate &&
                request.internalDueDate < request.dueDate
              ? request.internalDueDate
              : request.dueDate
          }
          onChange={() => {}}
          disabled={true} // O true si solo visualizar
        />

        {isAdmin && (
          <div className="flex flex-col ">
            <div className="text-base text-[#5E6B66] ">Internal Due Date</div>
            <CustomDatePicker
              value={request.internalDueDate}
              //@ts-ignore
              onChange={handleInternalDueDateChange}
              disabled={loadingUpdate} // Deshabilitar mientras se actualiza
            />
          </div>
        )}
      </div>
      {/* Time Spent */}
      <div className="flex flex-col ">
        <div className="text-base text-[#5E6B66]">Time Spent</div>
        <TimeSpentInput
          hours={request.timeSpentHr || 0}
          minutes={request.timeSpentMin || 0}
          readOnly // solo lectura
          onChangeHours={undefined} onChangeMinutes={undefined}        />
      </div>
      {/* Type */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="text-base text-[#5E6B66]">Request Type</div>
        <div className="font-medium text-[#181B1A]">{requestType.main}</div>
        <div className="flex items-center gap-2">
          <span className="ml-2 text-2xl">↳</span>
          <span className="text-[#181B1A]">{requestType.sub}</span>
        </div>
      </div>
      {/* Credits */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="text-base text-[#5E6B66]">Credits</div>
        <span className="font-medium text-[#181B1A]">{request.credits}</span>
      </div>
    </aside>
  );
}
