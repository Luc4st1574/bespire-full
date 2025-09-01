export const mockClients = [
    {
        id: 1,
        name: "Anna Patel",
        role: "Chief Product Officer",
        organization: "Visionary Designs",
        plan: {
            name: "Growth",
            bg: "#F6F8F5",
            icon: "/assets/icons/plans/growth.svg"
        },
        rating: 4.8,
        timeRequest: "3.2 hours",
        revisions: "1.2 revisions",
        lastSession: "Feb 1, 2025",
        contractStart: "Feb 1, 2025",
        status: "New",
        avatar: "/avatars/anna.jpg",
    },
    {
        id: 2,
        name: "David Kim",
        role: "Senior Product Manager",
        organization: "Spherule",
        plan: {
            name: "Pro",
            bg: "#F3FEE7",
            icon: "/assets/icons/plans/pro.svg"
        },
        rating: 4.3,
        timeRequest: "5.4 hours",
        revisions: "2.0 revisions",
        lastSession: "Mar 3, 2025",
        contractStart: "Jan 29, 2025",
        status: "New",
        avatar: "/avatars/david.jpg",
    },
    {
        id: 3,
        name: "Lisa Fernandez",
        role: "Director of Marketing",
        organization: "Spherule Inc.",
        plan: {
            name: "Growth",
            bg: "#F6F8F5",
            icon: "/assets/icons/plans/growth.svg"
        },
        rating: 4.7,
        timeRequest: "3.8 hours",
        revisions: "3.0 revisions",
        lastSession: "Jan 30, 2025",
        contractStart: "Mar 12, 2023",
        status: "Recurring",
        avatar: "/avatars/lisa.jpg",
    },
    {
        id: 4,
        name: "John Carter",
        role: "VP Marketing",
        organization: "Innovator LLC",
        plan: {
            name: "Growth",
            bg: "#F6F8F5",
            icon: "/assets/icons/plans/growth.svg"
        },
        rating: 4.2,
        timeRequest: "4.7 hours",
        revisions: "1.5 revisions",
        lastSession: "Jan 28, 2025",
        contractStart: "Sep 5, 2022",
        status: "Recurring",
        avatar: "/avatars/john.jpg",
    },
    {
        id: 5,
        name: "Emily Baker",
        role: "Head of UX",
        organization: "Insightful Labs",
        plan: {
            name: "Starter",
            bg: "#EBF1FF",
            icon: "/assets/icons/plans/starter.svg"
        },
        rating: 4.5,
        timeRequest: "6.2 hours",
        revisions: "2.3 revisions",
        lastSession: "Apr 7, 2025",
        contractStart: "Nov 15, 2022",
        status: "Recurring",
        avatar: "/avatars/emily.jpg",
    },
    {
        id: 6,
        name: "Michael Nguyen",
        role: "Senior Data Manager",
        organization: "Quantum Analytics",
        plan: {
            name: "Starter",
            bg: "#EBF1FF",
            icon: "/assets/icons/plans/starter.svg"
        },
        rating: 4.9,
        timeRequest: "5.1 hours",
        revisions: "1.8 revisions",
        lastSession: "May 2, 2025",
        contractStart: "Dec 5, 2022",
        status: "Recurring",
        avatar: "/avatars/michael.jpg",
    },
    {
        id: 7,
        name: "Sophia Garcia",
        role: "Program Director",
        organization: "Strategic Solutions",
        plan: {
            name: "Pro",
            bg: "#F3FEE7",
            icon: "/assets/icons/plans/pro.svg"
        },
        rating: 4.1,
        timeRequest: "4.4 hours",
        revisions: "2.1 revisions",
        lastSession: "Jun 10, 2025",
        contractStart: "Nov 30, 2022",
        status: "Recurring",
        avatar: "/avatars/sophia.jpg",
    },
    {
        id: 8,
        name: "Rebecca Romeo",
        role: "Marketing Director",
        organization: "Strategic Solutions",
        plan: {
            name: "Pro",
            bg: "#F3FEE7",
            icon: "/assets/icons/plans/pro.svg"
        },
        rating: 4.1,
        timeRequest: "4.4 hours",
        revisions: "3.2 revisions",
        lastSession: "Jun 10, 2025",
        contractStart: "Nov 30, 2022",
        status: "Recurring",
        avatar: "/avatars/rebecca.jpg",
    },
];

export const overviewMetrics = {
    updates: {
        title: "Updates",
        subtitle: "Smart Insights",
        description: "5 clients upgraded to Growth Plan this week",
        planBreakdown: {
            starter: 5,
            growth: 10,
            pro: 8,
            custom: 2
        }
    },
    activeClients: {
        count: 12,
        percentage: "6.27%",
        description: "Clients with active requests",
    },
    revisionRate: {
        rate: "1.8 revisions",
        percentage: "8.36%",
        description: "Tasks required revisions",
    },
    overallRating: {
        rating: "4.8/5 stars",
        percentage: "5.27%",
        description: "Across 32 completed tasks",
    },
    taskVolume: {
        count: "120 tasks",
        percentage: "8.36%",
        description: "Tasks sent this week",
    },
};

// Mock data dinámico por período
export const overviewMetricsByPeriod = {
    day: {
        updates: {
            title: "Daily Updates",
            subtitle: "Today's Insights",
            description: "2 new clients started projects today",
            planBreakdown: {
                starter: 1,
                growth: 3,
                pro: 2,
                custom: 1
            }
        },
        activeClients: {
            count: 7,
            percentage: "12.5%",
            description: "Clients active today",
        },
        revisionRate: {
            rate: "0.9 revisions",
            percentage: "3.2%",
            description: "Daily revision rate",
        },
        overallRating: {
            rating: "4.9/5 stars",
            percentage: "2.1%",
            description: "Today's completed tasks",
        },
        taskVolume: {
            count: "15 tasks",
            percentage: "15.8%",
            description: "Tasks completed today",
        },
    },
    week: {
        updates: {
            title: "Weekly Updates",
            subtitle: "This Week's Insights",
            description: "5 clients upgraded to Growth Plan this week",
            planBreakdown: {
                starter: 5,
                growth: 10,
                pro: 8,
                custom: 2
            }
        },
        activeClients: {
            count: 12,
            percentage: "6.27%",
            description: "Clients with active requests",
        },
        revisionRate: {
            rate: "1.8 revisions",
            percentage: "8.36%",
            description: "Weekly revision average",
        },
        overallRating: {
            rating: "4.8/5 stars",
            percentage: "5.27%",
            description: "Across 32 completed tasks",
        },
        taskVolume: {
            count: "120 tasks",
            percentage: "8.36%",
            description: "Tasks sent this week",
        },
    },
    month: {
        updates: {
            title: "Monthly Updates",
            subtitle: "This Month's Growth",
            description: "18 clients upgraded plans this month",
            planBreakdown: {
                starter: 12,
                growth: 25,
                pro: 18,
                custom: 8
            }
        },
        activeClients: {
            count: 45,
            percentage: "11.2%",
            description: "Active clients this month",
        },
        revisionRate: {
            rate: "2.3 revisions",
            percentage: "12.4%",
            description: "Monthly revision average",
        },
        overallRating: {
            rating: "4.7/5 stars",
            percentage: "7.8%",
            description: "Across 156 completed tasks",
        },
        taskVolume: {
            count: "580 tasks",
            percentage: "22.1%",
            description: "Total monthly tasks",
        },
    },
    year: {
        updates: {
            title: "Annual Updates",
            subtitle: "Yearly Performance",
            description: "127 clients joined our platform this year",
            planBreakdown: {
                starter: 85,
                growth: 142,
                pro: 98,
                custom: 35
            }
        },
        activeClients: {
            count: 360,
            percentage: "18.7%",
            description: "Total active clients",
        },
        revisionRate: {
            rate: "2.1 revisions",
            percentage: "9.8%",
            description: "Annual revision average",
        },
        overallRating: {
            rating: "4.6/5 stars",
            percentage: "12.3%",
            description: "Across 2,847 completed tasks",
        },
        taskVolume: {
            count: "4,230 tasks",
            percentage: "35.6%",
            description: "Total yearly tasks",
        },
    },
};

export type Client = typeof mockClients[0];
export type OverviewMetrics = typeof overviewMetrics;
export type OverviewMetricsByPeriod = typeof overviewMetricsByPeriod;
