import { useQuery, ApolloError } from '@apollo/client';
import { GET_ALL_CLIENTS_EXTENDED } from '@/graphql/queries/clients/getAllClientsExtended';

export interface ClientExtended {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  roleTitle?: string;
  workspaceId: string;
  workspaceName: string;
  companyId: string;
  companyName: string;
  companyWebsite?: string;
  companyLocation?: string;
  isWorkspaceOwner: boolean;
  workspaceRole?: string;
  phoneNumber?: string;
  countryCode?: string;
  notes?: string;
  successManagerId?: string;
  successManagerName?: string;
  plan?: {
    name: string;
    icon?: string;
    bg?: string;
  };
  rating: number;
  timeRequest?: string;
  revisions?: string;
  lastSession?: Date;
  contractStart?: Date;
  status: string;
  totalRequests: number;
  completedRequests: number;
  totalRevisions: number;
}

export interface UseClientsExtendedResult {
  clients: ClientExtended[];
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
}

export const useClientsExtended = (): UseClientsExtendedResult => {
  const { data, loading, error, refetch } = useQuery(GET_ALL_CLIENTS_EXTENDED, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const clients = data?.getAllClientsExtended || [];

  return {
    clients,
    loading,
    error,
    refetch,
  };
};
