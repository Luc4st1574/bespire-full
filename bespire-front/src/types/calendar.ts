export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    // FIX: Changed 'start' and 'end' to match your database schema
    startDate: string; // ISO date string
    endDate: string;   // ISO date string
    allDay: boolean;
    isArchived: boolean;
    location?: string;
    visibility: 'public' | 'private';
    notification?: string;
    eventType: EventType;
    assignedTo?: UserAssigned | Company;
    invitedPeople: UserAssigned[];
    links: Link[];
    files: File[];
}

// Represents the type/category of an event
export interface EventType {
    id: string;
    name: string;
    backgroundColor: string;
    borderColor: string;
}

// Represents a company that can be assigned to an event
export interface Company {
    _id: string;
    name: string;
}

// Represents a team member who can be assigned or invited
export interface TeamMember {
    _id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    teamRole?: string;
}

// Represents a user assigned to an event
export interface UserAssigned {
    id: string;
    name: string;
    avatarUrl?: string;
    teamRole?: string;
}

// Represents a link attached to an event
interface Link {
    _id: string;
    url: string;
    title?: string;
    favicon?: string;
}

// Represents a file attached to an event
interface File {
    _id: string;
    name: string;
    url: string;
    ext?: string;
    size?: number;
}