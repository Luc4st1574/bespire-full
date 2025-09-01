// mocks/notifications.ts
export const mockNotifications = [
  {
    id: "1",
    type: "request_submitted",
    title: "Request Submitted Successfully.",
    description: "Your request is being reviewed by the team.",
    category: "request",
    date: new Date(Date.now() - 10 * 60 * 1000), // 10 minutos atrás
    avatar: "/assets/icons/type_request.svg",
    unread: true,
  },
  {
    id: "2",
    type: "comment",
    title: "Barbara Smith commented on your request.",
    description: "Review her feedback.",
    message: "Hello Mario, I would greatly appreciate it if you could create PDFs...",
    category: "request",
    date: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    unread: true,
  },
  {
    id: "3",
    type: "analytics_report",
    title: "Analytics Report Ready.",
    description: "Get insights into how your projects are performing.",
    category: "analytic",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
    avatar: "/assets/icons/notification-analytics.svg",
    unread: false,
  },
  {
    id: "4",
    type: "template_added",
    title: "New Template Added to the Library.",
    description: "Check out the latest design for your workspace.",
    category: "library",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 días atrás
    avatar: "/assets/icons/notification-analytics.svg",
    unread: false,
  },
  {
    id: "5",
    type: "comment",
    title: "John Doe replied to your comment.",
    description: "See his response to your feedback.",
    message: "Thank you for your input, Mario. We will consider it in the next update.",
    category: "request",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    unread: false,
  },
  {
    id: "6",
    type: "comment",
    title: "Alice Johnson commented on your request.",
    description: "Check out her latest feedback.",
    message: "Mario, the changes look great! Can you also update the header?",
    category: "requests",
    date: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    unread: true,
  },
  {
    id: "7",
    type: "comment",
    title: "Carlos Rivera replied to your comment.",
    description: "See his response to your suggestion.",
    message: "Thanks for the suggestion, I'll work on it this week.",
    category: "request",
    date: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    unread: false,
  },
  {
    id: "8",
    type: "comment",
    title: "Emily Clark commented on your request.",
    description: "Read her thoughts on your proposal.",
    message: "I think this is a great idea! Let's discuss it further.",
    category: "request",
    date: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    unread: true,
  },
  {
    id: "9",
    type: "comment",
    title: "Michael Brown replied to your comment.",
    description: "Check out his feedback.",
    message: "Good catch, Mario. I'll fix that bug ASAP.",
    category: "request",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    unread: false,
  },
  {
    id: "10",
    type: "comment",
    title: "Sophie Lee commented on your request.",
    description: "See her suggestions.",
    message: "Can we add a dark mode option to this feature?",
    category: "request",
    date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    avatar: "https://randomuser.me/api/portraits/women/23.jpg",
    unread: true,
  },
  {
    id: "11",
    type: "comment",
    title: "David Kim replied to your comment.",
    description: "Read his latest response.",
    message: "I'll send you the updated files by tomorrow.",
    category: "request",
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    avatar: "https://randomuser.me/api/portraits/men/78.jpg",
    unread: false,
  },
  {
    id: "12",
    type: "comment",
    title: "Laura Martinez commented on your request.",
    description: "Check her feedback.",
    message: "Looks good! Can you add more details to the report?",
    category: "request",
    date: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    avatar: "https://randomuser.me/api/portraits/women/34.jpg",
    unread: true,
  },
  {
    id: "13",
    type: "comment",
    title: "Tom Wilson replied to your comment.",
    description: "See his answer.",
    message: "I'll review the code and get back to you.",
    category: "requests",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    avatar: "https://randomuser.me/api/portraits/men/56.jpg",
    unread: false,
  },
  {
    id: "14",
    type: "comment",
    title: "Natalie Evans commented on your request.",
    description: "Read her input.",
    message: "Great job! The UI looks much cleaner now.",
    category: "requests",
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    avatar: "https://randomuser.me/api/portraits/women/41.jpg",
    unread: false,
  },
  {
    id: "15",
    type: "comment",
    title: "Oscar Perez replied to your comment.",
    description: "See his latest feedback.",
    message: "Let me know if you need any help with the backend.",
    category: "requests",
    date: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    avatar: "https://randomuser.me/api/portraits/men/90.jpg",
    unread: true,
  },
];
