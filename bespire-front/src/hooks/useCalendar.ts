import { useQuery, useMutation } from "@apollo/client";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import {
    CREATE_CALENDAR_EVENT,
    UPDATE_CALENDAR_EVENT,
    REMOVE_CALENDAR_EVENT,
} from "@/graphql/mutations/calendar/manageCalendarEvents";
import {
    GET_CALENDAR_EVENTS,
    GET_EVENT_TYPES,
    GET_COMPANIES_FOR_CALENDAR,
    GET_TEAM_MEMBERS_FOR_CALENDAR,
} from "@/graphql/queries/calendar/getCalendarEvents";

import { useWorkspace } from "./useWorkspace";


export interface CreateCalendarEventInput {
    title: string;
    startDate: string;
    endDate?: string;
    allDay: boolean;
    isArchived?: boolean;
    eventType: string;
    assignedToUser?: string;
    assignedToCompany?: string;
    invitedPeople?: string[];
    workspace: string;
    description?: string;
    location?: string;
    visibility?: 'public' | 'private';
    notification?: string;
    links?: string[];
    files?: string[];
}

export interface UpdateCalendarEventInput extends Partial<CreateCalendarEventInput> {
    id: string;
    }


    // Helper function to format dates for the API
    const toAPIDate = (date: Date) => date.toISOString().split("T")[0];

    /**
     * A comprehensive hook to manage calendar events, types, and related data.
     */
    export function useCalendar() {
    const { workspaceId } = useWorkspace();
    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { start, end };
    });

    // --- QUERIES ---

    const {
        data: eventsData,
        loading: eventsLoading,
        error: eventsError,
        refetch: refetchEvents,
    } = useQuery(GET_CALENDAR_EVENTS, {
        variables: {
        workspaceId,
        start: toAPIDate(dateRange.start),
        end: toAPIDate(dateRange.end),
        },
        skip: !workspaceId,
        fetchPolicy: "cache-and-network",
    });

    const { data: eventTypesData, loading: eventTypesLoading } = useQuery(
        GET_EVENT_TYPES,
        {
        variables: { workspaceId },
        skip: !workspaceId,
        }
    );

    const { data: companiesData, loading: companiesLoading } = useQuery(
        GET_COMPANIES_FOR_CALENDAR
    );

    const { data: teamMembersData, loading: teamMembersLoading } = useQuery(
        GET_TEAM_MEMBERS_FOR_CALENDAR,
        {
        variables: { workspaceId },
        skip: !workspaceId,
        }
    );

    // --- MUTATIONS ---

    const [createEventMutation, { loading: isCreating }] = useMutation(
        CREATE_CALENDAR_EVENT
    );
    const [updateEventMutation, { loading: isUpdating }] = useMutation(
        UPDATE_CALENDAR_EVENT
    );
    const [removeEventMutation, { loading: isDeleting }] = useMutation(
        REMOVE_CALENDAR_EVENT
    );

    // --- HANDLER FUNCTIONS ---

    const createEvent = useCallback(
        async (input: CreateCalendarEventInput) => {
        try {
            const response = await createEventMutation({
            variables: { createCalendarInput: input },
            refetchQueries: [
                {
                query: GET_CALENDAR_EVENTS,
                variables: {
                    workspaceId,
                    start: toAPIDate(dateRange.start),
                    end: toAPIDate(dateRange.end),
                },
                },
            ],
            });
            return response.data?.createCalendar;
        } catch (e: unknown) {
            const errorMessage =
            e instanceof Error ? e.message : "Error creating event";
            toast.error(errorMessage);
            throw e;
        }
        },
        [createEventMutation, workspaceId, dateRange]
    );

    const updateEvent = useCallback(
        async (input: UpdateCalendarEventInput) => {
        try {
            const response = await updateEventMutation({
            variables: { updateCalendarInput: input },
            refetchQueries: [
                {
                query: GET_CALENDAR_EVENTS,
                variables: {
                    workspaceId,
                    start: toAPIDate(dateRange.start),
                    end: toAPIDate(dateRange.end),
                },
                },
            ],
            });
            return response.data?.updateCalendar;
        } catch (e: unknown) {
            const errorMessage =
            e instanceof Error ? e.message : "Error updating event";
            toast.error(errorMessage);
            throw e;
        }
        },
        [updateEventMutation, workspaceId, dateRange]
    );

    const removeEvent = useCallback(
        async (id: string) => {
        try {
            const response = await removeEventMutation({
            variables: { id },
            refetchQueries: [
                {
                query: GET_CALENDAR_EVENTS,
                variables: {
                    workspaceId,
                    start: toAPIDate(dateRange.start),
                    end: toAPIDate(dateRange.end),
                },
                },
            ],
            });
            return response.data?.removeCalendar;
        } catch (e: unknown) {
            const errorMessage =
            e instanceof Error ? e.message : "Error removing event";
            toast.error(errorMessage);
            throw e;
        }
        },
        [removeEventMutation, workspaceId, dateRange]
    );

    // --- MEMOIZED VALUES ---

    const events = useMemo(() => eventsData?.calendar || [], [eventsData]);
    const eventTypes = useMemo(
        () => eventTypesData?.eventTypes || [],
        [eventTypesData]
    );
    const companies = useMemo(
        () => companiesData?.getAllClients || [],
        [companiesData]
    );
    const teamMembers = useMemo(
        () => teamMembersData?.getWorkspaceMembers || [],
        [teamMembersData]
    );

    return {
        // Data
        events,
        eventTypes,
        companies,
        teamMembers,

        // Loading states
        loading:
        eventsLoading ||
        eventTypesLoading ||
        companiesLoading ||
        teamMembersLoading,
        isCreating,
        isUpdating,
        isDeleting,

        // Errors
        error: eventsError,

        // Actions
        createEvent,
        updateEvent,
        removeEvent,
        refetchEvents,
        setDateRange,
    };
}