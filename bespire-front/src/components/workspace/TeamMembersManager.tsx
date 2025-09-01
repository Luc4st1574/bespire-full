/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// components/TeamMembersManager.tsx
import { useState } from "react";
import Spinner from "../Spinner";
import Button from "../ui/Button";
import TeamMemberRow from "../members/TeamMemberRow";
import { showSuccessToast, showErrorToast } from "../ui/toast";
import Swal from "sweetalert2";
import { useAppContext } from "@/context/AppContext";
import { useMembers } from "@/hooks/useMembers";
import { TEAM_ROLE_LABELS } from "@/constants/teamRoles";
const roles = ["admin", "user", "viewer"];

type Props = {
  workspaceId: string;
  maxMembers?: number;
  ownerId?: string;
};

export default function TeamMembersManager({
  workspaceId,
  maxMembers,
  ownerId,
}: Props) {
  const { user } = useAppContext();
  
const { members, inviteMember, updateMemberRole, removeMember, refetch, loading } = useMembers(workspaceId);

console.log("Members:", members);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Detecta si es admin bespire
  const isAdminBespire = user?.role === "admin";

  const [teamRole, setTeamRole] = useState("");
  const [title, setTitle] = useState("");



  const handleAdd = async () => {
    const emailTrimmed = email.trim().toLowerCase();
    setEmailError(null);

    if (!emailTrimmed) {
      setEmailError("Please enter an email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (members.some((m: { email: string; }) => m.email === emailTrimmed)) {
      setEmailError("This user is already added.");
      return;
    }
    if (maxMembers && members.length >= maxMembers) {
      setEmailError("You reached the maximum number of members.");
      return;
    }
    setIsChecking(true);
    try {
      await inviteMember({
        variables: {
          workspaceId,
          member: {
            email: emailTrimmed,
            role,
            ...(isAdminBespire ? { teamRole } : {}),
            ...(!isAdminBespire ? { title } : {}),
          },
        },
      });
      await refetch();
      setEmail("");
      setRole("user");
    } catch (err) {
      setEmailError("An error occurred while inviting the member.");
    } finally {
      setIsChecking(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="bg-[#F6F7F7] p-6 rounded-lg w-full  mb-8">
      {/* Formulario de invitación */}
      <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
        <div className="flex-1 text-sm">
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Invite with email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter Email Address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(null);
            }}
            className={`bg-white w-full border outline-none rounded px-3 py-2 ${
              emailError ? "border-red-400" : "border-gray-300"
            }`}
            autoComplete="off"
          />
          {isChecking && (
            <p className="text-xs text-blue-500 mt-1">Checking...</p>
          )}
          {emailError && !isChecking && (
            <p className="text-xs text-red-500 mt-1">{emailError}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="role">
            Type
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-white border outline-none border-gray-300 rounded px-3 py-2"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          {isAdminBespire ? (
            <>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="teamRole"
              >
                Team Role
              </label>
              <select
                id="teamRole"
                value={teamRole}
                onChange={(e) => setTeamRole(e.target.value)}
                className="w-full bg-white border outline-none border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select...</option>
                {Object.entries(TEAM_ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
                {/* ...etc */}
              </select>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium mb-1" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Ej: VP Marketing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border outline-none border-gray-300 rounded px-3 py-2"
              />
            </>
          )}
        </div>
        <div>
          <label
            className="block invisible text-sm font-medium mb-1"
            htmlFor="invite"
          >
            Add
          </label>
          <Button
            type="button"
            variant="green2"
            size="md"
            disabled={isChecking || !email}
            onClick={handleAdd}
            label="Invite"
          />
        </div>
      </div>

      {/* Lista de miembros */}
      <ul className="flex flex-col gap-6">
        {members.map((member: any, idx: any) => {
          const isYou = user?.email && member.email === user.email;
          return (
            <TeamMemberRow
              key={member._id || idx}
              member={member}
              roles={roles}
              //@ts-ignore
              isYou={isYou}
              isOwner={ownerId === member._id}
              onRoleChange={async (newRole) => {
                if (member.role === newRole) return; // No cambió nada
                const result = await Swal.fire({
                  title: "Change member role?",
                  text: `Are you sure you want to set this member as "${newRole}"?`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#6DA77F",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, change it!",
                });
                if (!result.isConfirmed) return;
                try {
                  await updateMemberRole({
                    variables: {
                      input: {
                        workspaceId,
                        memberId: member._id,
                        role: newRole,
                      },
                    },
                  });
                  await refetch();
                  showSuccessToast("Member role updated!");
                } catch (e) {
                  showErrorToast(
                    e instanceof Error
                      ? e.message
                      : "Error updating member role."
                  );
                }
              }}
              onRemove={async () => {
                const result = await Swal.fire({
                  title: "Remove member?",
                  text: "This action cannot be undone.",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#d33",
                  cancelButtonColor: "#6DA77F",
                  confirmButtonText: "Yes, remove",
                });
                if (!result.isConfirmed) return;
                try {
                  await removeMember({
                    variables: { input: { workspaceId, memberId: member._id } },
                  });
                  await refetch();
                  showSuccessToast("Member removed.");
                } catch (e) {
                  showErrorToast(
                    e instanceof Error ? e.message : "Error removing member."
                  );
                }
              }}
            />
          );
        })}
      </ul>
    </div>
  );
}
