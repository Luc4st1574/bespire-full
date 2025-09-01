// src/hooks/useMembers.ts
import { useMutation, useQuery } from "@apollo/client";
import { GET_WORKSPACE_MEMBERS } from "@/graphql/queries/workspace/getWorkspaceMembers";
import { INVITE_MEMBER } from "@/graphql/mutations/workspace/inviteMember";
import { REMOVE_MEMBER } from "@/graphql/mutations/workspace/removeMember";
import { UPDATE_MEMBER_ROLE } from "@/graphql/mutations/workspace/updateRoleMember";

export function useMembers(workspaceId: string) {
  const { data, loading, refetch } = useQuery(GET_WORKSPACE_MEMBERS, {
    variables: { workspaceId },
    skip: !workspaceId,
  });

  const [inviteMember, { loading: loadingInvite }] = useMutation(INVITE_MEMBER);
  const [removeMember, { loading: loadingRemove }] = useMutation(REMOVE_MEMBER);
  const [updateMemberRole, { loading: loadingUpdate }] = useMutation(UPDATE_MEMBER_ROLE);

  return {
    members: data?.getWorkspaceMembers || [],
    loading,
    inviteMember,
    loadingInvite,
    removeMember,
    loadingRemove,
    updateMemberRole,
    loadingUpdate,
    refetch
  };
}
