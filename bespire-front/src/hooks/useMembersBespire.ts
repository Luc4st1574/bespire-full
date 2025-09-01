import { useAppContext } from "@/context/AppContext";
import { GET_MEMBERS_BESPIRE, MEMBERS_BY_LINKED_TO } from "@/graphql/queries/users/search_members";
import { useQuery } from "@apollo/client";
import { useMemo, useState } from "react";

type UseMembersBespireProps = {
  linkedToId?: string | null;
  initialSearch?: string;
};
const ADMIN_ROLES = ["admin", "success_manager"];
export function useMembersBespire({
  linkedToId = null,
  initialSearch = "",
}: UseMembersBespireProps = {}) {
  const { role } = useAppContext();
  const [search, setSearch] = useState(initialSearch);

  console.log("useMembersBespire called with role:", role, "linkedToId:", linkedToId, "search:", search);

  const isAdminLike = ADMIN_ROLES.includes(role ?? "client");
  console.log("isAdminLike:", isAdminLike);

  const query = useMemo(
    () => (isAdminLike ? GET_MEMBERS_BESPIRE : MEMBERS_BY_LINKED_TO),
    [isAdminLike]
  );
  const variables = isAdminLike ? { search } : { linkedToId };

  const { data, loading, error, refetch } = useQuery(query, {
    variables,
    skip: !isAdminLike && !linkedToId, // Saltar si falta linkedToId y no es admin
   fetchPolicy: isAdminLike ? "network-only" : "cache-first", // <-- aquí el truco
  });

  const members = isAdminLike
    ? data?.getMembersBespire || []
    : data?.membersByLinkedTo || [];

    console.log("useMembersBespire data:", data, "members:", members);

  return {
    members,
    loading,
    error,
    search,
    setSearch,
    refetch,
    isAdminLike,
  };
}
