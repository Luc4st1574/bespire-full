
import { gql } from '@apollo/client';

export const GET_MEMBERS_BESPIRE = gql`
  query getMembersBespire($search: String!) {
    getMembersBespire(search: $search) {
     id
    name
    avatarUrl
    teamRole
    }
  }
`;

export const MEMBERS_BY_LINKED_TO = gql`
  query membersByLinkedTo($linkedToId: String!) {
    membersByLinkedTo(linkedToId: $linkedToId) {
     id
    name
    avatarUrl
    teamRole
    }
  }
`;

