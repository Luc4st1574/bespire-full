export interface Link {
    id?: string;
    url: string;
    title: string;
    favicon?: string;
    linkedToId: string;
    linkedToType: "request" | "project" | "task";
}