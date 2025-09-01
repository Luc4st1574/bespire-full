// Mock data para requests de clientes

export interface ClientRequest {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'none';
  deadline: string;
  status: 'requests' | 'in_progress' | 'pending' | 'completed';
  createdAt: string;
}

export const clientRequestsData: ClientRequest[] = [
  // Requests
{
    id: "1",
    title: "Hero Image for Christmas",
    priority: "high",
    deadline: "Dec 14, 2024",
    status: "requests",
    createdAt: "Dec 12, 2024"
},
{
    id: "2",
    title: "Business Cards",
    priority: "high",
    deadline: "Dec 14, 2024",
    status: "requests",
    createdAt: "Dec 12, 2024"
},
{
    id: "3",
    title: "Spherule Landing Page",
    priority: "high",
    deadline: "Dec 14, 2024",
    status: "requests",
    createdAt: "Dec 12, 2024"
},
{
    id: "4",
    title: "Product Catalog",
    priority: "medium",
    deadline: "Dec 16, 2024",
    status: "requests",
    createdAt: "Dec 10, 2024"
},
{
    id: "5",
    title: "Social Media Templates",
    priority: "low",
    deadline: "Dec 18, 2024",
    status: "requests",
    createdAt: "Dec 9, 2024"
},

  // In Progress
  {
    id: "6",
    title: "Website Redesign",
    priority: "high",
    deadline: "Dec 20, 2024",
    status: "in_progress",
    createdAt: "Dec 5, 2024"
  },
  {
    id: "7",
    title: "Logo Animation",
    priority: "medium",
    deadline: "Dec 22, 2024",
    status: "in_progress",
    createdAt: "Dec 8, 2024"
  },

  // Pending
  {
    id: "8",
    title: "Email Campaign Design",
    priority: "medium",
    deadline: "Dec 25, 2024",
    status: "pending",
    createdAt: "Dec 1, 2024"
  },

  // Completed
  {
    id: "9",
    title: "Business Cards Revision",
    priority: "high",
    deadline: "Dec 10, 2024",
    status: "completed",
    createdAt: "Nov 28, 2024"
  },
  {
    id: "10",
    title: "Website Banner",
    priority: "medium",
    deadline: "Dec 8, 2024",
    status: "completed",
    createdAt: "Nov 25, 2024"
  },
  {
    id: "11",
    title: "Product Packaging",
    priority: "medium",
    deadline: "Dec 5, 2024",
    status: "completed",
    createdAt: "Nov 20, 2024"
  },
  {
    id: "12",
    title: "Social Media Graphics",
    priority: "low",
    deadline: "Dec 3, 2024",
    status: "completed",
    createdAt: "Nov 18, 2024"
  },
  {
    id: "13",
    title: "Brochure Design",
    priority: "medium",
    deadline: "Nov 30, 2024",
    status: "completed",
    createdAt: "Nov 15, 2024"
  },
  {
    id: "14",
    title: "App Icon Design",
    priority: "high",
    deadline: "Nov 28, 2024",
    status: "completed",
    createdAt: "Nov 12, 2024"
  },
  {
    id: "15",
    title: "Newsletter Template",
    priority: "low",
    deadline: "Nov 25, 2024",
    status: "completed",
    createdAt: "Nov 10, 2024"
  },
  {
    id: "16",
    title: "Trade Show Banner",
    priority: "medium",
    deadline: "Nov 22, 2024",
    status: "completed",
    createdAt: "Nov 8, 2024"
  },
  {
    id: "17",
    title: "Instagram Story Templates",
    priority: "low",
    deadline: "Nov 20, 2024",
    status: "completed",
    createdAt: "Nov 5, 2024"
  },
  {
    id: "18",
    title: "Company Presentation",
    priority: "high",
    deadline: "Nov 18, 2024",
    status: "completed",
    createdAt: "Nov 3, 2024"
  },
  {
    id: "19",
    title: "Product Sheet Design",
    priority: "medium",
    deadline: "Nov 15, 2024",
    status: "completed",
    createdAt: "Nov 1, 2024"
  },
  {
    id: "20",
    title: "Event Poster",
    priority: "high",
    deadline: "Nov 12, 2024",
    status: "completed",
    createdAt: "Oct 28, 2024"
  },
  {
    id: "21",
    title: "Web Graphics Package",
    priority: "medium",
    deadline: "Nov 10, 2024",
    status: "completed",
    createdAt: "Oct 25, 2024"
  },
  {
    id: "22",
    title: "Facebook Ad Campaign",
    priority: "high",
    deadline: "Nov 8, 2024",
    status: "completed",
    createdAt: "Oct 22, 2024"
  },
  {
    id: "23",
    title: "Catalog Cover Design",
    priority: "medium",
    deadline: "Nov 5, 2024",
    status: "completed",
    createdAt: "Oct 20, 2024"
  },
  {
    id: "24",
    title: "Email Signature Design",
    priority: "low",
    deadline: "Nov 3, 2024",
    status: "completed",
    createdAt: "Oct 18, 2024"
  },
  {
    id: "25",
    title: "Holiday Card Design",
    priority: "medium",
    deadline: "Nov 1, 2024",
    status: "completed",
    createdAt: "Oct 15, 2024"
  }
];

// Función helper para filtrar requests por status
export const getRequestsByStatus = (status: string) => {
  if (status === 'all') return clientRequestsData;
  return clientRequestsData.filter(request => request.status === status);
};

// Función helper para contar requests por status
export const getRequestsCounts = () => {
  const counts = {
    all: clientRequestsData.length,
    requests: 0,
    in_progress: 0,
    pending: 0,
    completed: 0
  };

  clientRequestsData.forEach(request => {
    counts[request.status as keyof typeof counts]++;
  });

  return counts;
};
