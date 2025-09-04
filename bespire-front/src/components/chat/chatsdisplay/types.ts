export interface Attachment {
    id: string;
    file: File;
    preview?: string; // Data URL for image previews
    status: 'uploading' | 'completed';
}

export interface ConversationMessage {
    sender: string;
    text: string;
    timestamp: string;
    attachments?: Attachment[];
}

export interface Chat {
    id: number;
    name: string;
    avatar: string;
    isOnline: boolean;
    conversation: ConversationMessage[];
}

export const currentUser = {
    name: "You",
    avatar: "/assets/icons/default_avatar.svg"
};