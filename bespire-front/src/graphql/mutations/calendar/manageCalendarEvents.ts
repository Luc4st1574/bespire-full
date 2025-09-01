// src/graphql/mutations/calendar/manageCalendarEvents.ts
import { gql } from '@apollo/client';

export const CREATE_CALENDAR_EVENT = gql`
    mutation CreateCalendarEvent($createCalendarInput: CreateCalendarInput!) {
        createCalendar(createCalendarInput: $createCalendarInput) {
        id
        }
    }
`;

export const UPDATE_CALENDAR_EVENT = gql`
    mutation UpdateCalendarEvent($updateCalendarInput: UpdateCalendarInput!) {
        updateCalendar(updateCalendarInput: $updateCalendarInput) {
        id
        }
    }
`;

export const REMOVE_CALENDAR_EVENT = gql`
    mutation RemoveCalendarEvent($id: ID!) {
        removeCalendar(id: $id) {
        id
        }
    }
`;