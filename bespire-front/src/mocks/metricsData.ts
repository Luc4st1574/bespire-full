// Mock data para los gráficos de métricas de cliente

export interface TaskDistributionItem {
  date: string;
  'New Task': number;
  'Revision': number;
  'Meetings': number;
}

export interface ProjectRatingItem {
  date: string;
  rangeMin: number;
  rangeMax: number;
  average: number;
}

export interface TaskCategoryItem {
  name: string;
  value: number;
  color: string;
}

// Datos para Task Distribution por período de tiempo
export const taskDistributionByPeriod = {
  day: {
    volume: [
      { date: 'Mon', 'New Task': 3, 'Revision': 2, 'Meetings': 1 },
      { date: 'Tue', 'New Task': 5, 'Revision': 1, 'Meetings': 2 },
      { date: 'Wed', 'New Task': 4, 'Revision': 3, 'Meetings': 1 },
      { date: 'Thu', 'New Task': 6, 'Revision': 2, 'Meetings': 3 },
      { date: 'Fri', 'New Task': 2, 'Revision': 4, 'Meetings': 2 },
      { date: 'Sat', 'New Task': 1, 'Revision': 1, 'Meetings': 0 },
      { date: 'Sun', 'New Task': 0, 'Revision': 2, 'Meetings': 1 }
    ],
    hours: [
      { date: 'Mon', 'New Task': 8, 'Revision': 4, 'Meetings': 2 },
      { date: 'Tue', 'New Task': 10, 'Revision': 3, 'Meetings': 4 },
      { date: 'Wed', 'New Task': 9, 'Revision': 6, 'Meetings': 2 },
      { date: 'Thu', 'New Task': 12, 'Revision': 5, 'Meetings': 6 },
      { date: 'Fri', 'New Task': 6, 'Revision': 8, 'Meetings': 4 },
      { date: 'Sat', 'New Task': 2, 'Revision': 3, 'Meetings': 0 },
      { date: 'Sun', 'New Task': 0, 'Revision': 4, 'Meetings': 2 }
    ],
    percentage: [
      { date: 'Mon', 'New Task': 50, 'Revision': 33, 'Meetings': 17 },
      { date: 'Tue', 'New Task': 63, 'Revision': 12, 'Meetings': 25 },
      { date: 'Wed', 'New Task': 50, 'Revision': 38, 'Meetings': 12 },
      { date: 'Thu', 'New Task': 55, 'Revision': 18, 'Meetings': 27 },
      { date: 'Fri', 'New Task': 25, 'Revision': 50, 'Meetings': 25 },
      { date: 'Sat', 'New Task': 50, 'Revision': 50, 'Meetings': 0 },
      { date: 'Sun', 'New Task': 0, 'Revision': 67, 'Meetings': 33 }
    ]
  },
  week: {
    volume: [
      { date: 'Dec 16', 'New Task': 12, 'Revision': 8, 'Meetings': 5 },
      { date: 'Dec 23', 'New Task': 10, 'Revision': 6, 'Meetings': 2 },
      { date: 'Dec 30', 'New Task': 11, 'Revision': 9, 'Meetings': 3 },
      { date: 'Jan 6', 'New Task': 9, 'Revision': 7, 'Meetings': 2 },
      { date: 'Jan 13', 'New Task': 13, 'Revision': 8, 'Meetings': 4 },
      { date: 'Jan 20', 'New Task': 11, 'Revision': 6, 'Meetings': 5 },
      { date: 'Jan 27', 'New Task': 14, 'Revision': 7, 'Meetings': 3 }
    ],
    hours: [
      { date: 'Dec 16', 'New Task': 32, 'Revision': 16, 'Meetings': 10 },
      { date: 'Dec 23', 'New Task': 25, 'Revision': 12, 'Meetings': 4 },
      { date: 'Dec 30', 'New Task': 28, 'Revision': 18, 'Meetings': 6 },
      { date: 'Jan 6', 'New Task': 22, 'Revision': 14, 'Meetings': 4 },
      { date: 'Jan 13', 'New Task': 35, 'Revision': 16, 'Meetings': 8 },
      { date: 'Jan 20', 'New Task': 28, 'Revision': 12, 'Meetings': 10 },
      { date: 'Jan 27', 'New Task': 38, 'Revision': 14, 'Meetings': 6 }
    ],
    percentage: [
      { date: 'Dec 16', 'New Task': 48, 'Revision': 32, 'Meetings': 20 },
      { date: 'Dec 23', 'New Task': 56, 'Revision': 33, 'Meetings': 11 },
      { date: 'Dec 30', 'New Task': 48, 'Revision': 39, 'Meetings': 13 },
      { date: 'Jan 6', 'New Task': 50, 'Revision': 39, 'Meetings': 11 },
      { date: 'Jan 13', 'New Task': 52, 'Revision': 32, 'Meetings': 16 },
      { date: 'Jan 20', 'New Task': 50, 'Revision': 27, 'Meetings': 23 },
      { date: 'Jan 27', 'New Task': 58, 'Revision': 29, 'Meetings': 13 }
    ]
  },
  month: {
    volume: [
      { date: 'Sep', 'New Task': 45, 'Revision': 32, 'Meetings': 18 },
      { date: 'Oct', 'New Task': 52, 'Revision': 28, 'Meetings': 15 },
      { date: 'Nov', 'New Task': 38, 'Revision': 35, 'Meetings': 22 },
      { date: 'Dec', 'New Task': 48, 'Revision': 30, 'Meetings': 12 },
      { date: 'Jan', 'New Task': 55, 'Revision': 33, 'Meetings': 16 },
      { date: 'Feb', 'New Task': 42, 'Revision': 38, 'Meetings': 20 }
    ],
    hours: [
      { date: 'Sep', 'New Task': 135, 'Revision': 64, 'Meetings': 36 },
      { date: 'Oct', 'New Task': 156, 'Revision': 56, 'Meetings': 30 },
      { date: 'Nov', 'New Task': 114, 'Revision': 70, 'Meetings': 44 },
      { date: 'Dec', 'New Task': 144, 'Revision': 60, 'Meetings': 24 },
      { date: 'Jan', 'New Task': 165, 'Revision': 66, 'Meetings': 32 },
      { date: 'Feb', 'New Task': 126, 'Revision': 76, 'Meetings': 40 }
    ],
    percentage: [
      { date: 'Sep', 'New Task': 47, 'Revision': 34, 'Meetings': 19 },
      { date: 'Oct', 'New Task': 55, 'Revision': 29, 'Meetings': 16 },
      { date: 'Nov', 'New Task': 40, 'Revision': 37, 'Meetings': 23 },
      { date: 'Dec', 'New Task': 53, 'Revision': 33, 'Meetings': 13 },
      { date: 'Jan', 'New Task': 53, 'Revision': 32, 'Meetings': 15 },
      { date: 'Feb', 'New Task': 42, 'Revision': 38, 'Meetings': 20 }
    ]
  },
  year: {
    volume: [
      { date: '2020', 'New Task': 485, 'Revision': 342, 'Meetings': 198 },
      { date: '2021', 'New Task': 523, 'Revision': 389, 'Meetings': 234 },
      { date: '2022', 'New Task': 612, 'Revision': 445, 'Meetings': 267 },
      { date: '2023', 'New Task': 578, 'Revision': 423, 'Meetings': 289 },
      { date: '2024', 'New Task': 634, 'Revision': 456, 'Meetings': 245 }
    ],
    hours: [
      { date: '2020', 'New Task': 1455, 'Revision': 684, 'Meetings': 396 },
      { date: '2021', 'New Task': 1569, 'Revision': 778, 'Meetings': 468 },
      { date: '2022', 'New Task': 1836, 'Revision': 890, 'Meetings': 534 },
      { date: '2023', 'New Task': 1734, 'Revision': 846, 'Meetings': 578 },
      { date: '2024', 'New Task': 1902, 'Revision': 912, 'Meetings': 490 }
    ],
    percentage: [
      { date: '2020', 'New Task': 47, 'Revision': 33, 'Meetings': 19 },
      { date: '2021', 'New Task': 46, 'Revision': 34, 'Meetings': 20 },
      { date: '2022', 'New Task': 46, 'Revision': 34, 'Meetings': 20 },
      { date: '2023', 'New Task': 45, 'Revision': 33, 'Meetings': 22 },
      { date: '2024', 'New Task': 47, 'Revision': 34, 'Meetings': 18 }
    ]
  }
};

// Datos para Project Ratings por período
export const projectRatingsByPeriod = {
  all: [
    { date: 'Dec 2', rangeMin: 2, rangeMax: 4.5, average: 3.8 },
    { date: 'Dec 9', rangeMin: 3, rangeMax: 5, average: 4.2 },
    { date: 'Dec 16', rangeMin: 2.5, rangeMax: 4.8, average: 3.9 },
    { date: 'Dec 23', rangeMin: 1.5, rangeMax: 3.5, average: 2.8 },
    { date: 'Dec 30', rangeMin: 2, rangeMax: 4, average: 3.2 },
    { date: 'Jan 6', rangeMin: 3.5, rangeMax: 4.5, average: 4.0 },
    { date: 'Jan 13', rangeMin: 1, rangeMax: 4.2, average: 3.1 },
    { date: 'Jan 20', rangeMin: 2.8, rangeMax: 4.8, average: 4.1 },
    { date: 'Jan 27', rangeMin: 3, rangeMax: 5, average: 4.3 }
  ],
  'last-month': [
    { date: 'Jan 6', rangeMin: 3.5, rangeMax: 4.5, average: 4.0 },
    { date: 'Jan 13', rangeMin: 1, rangeMax: 4.2, average: 3.1 },
    { date: 'Jan 20', rangeMin: 2.8, rangeMax: 4.8, average: 4.1 },
    { date: 'Jan 27', rangeMin: 3, rangeMax: 5, average: 4.3 },
    { date: 'Feb 3', rangeMin: 2.5, rangeMax: 4.2, average: 3.7 },
    { date: 'Feb 10', rangeMin: 3.2, rangeMax: 4.8, average: 4.1 }
  ],
  'last-quarter': [
    { date: 'Oct', rangeMin: 2.8, rangeMax: 4.5, average: 3.8 },
    { date: 'Nov', rangeMin: 3.1, rangeMax: 4.7, average: 4.0 },
    { date: 'Dec', rangeMin: 2.2, rangeMax: 4.3, average: 3.4 },
    { date: 'Jan', rangeMin: 2.8, rangeMax: 4.6, average: 3.9 }
  ]
};

// Datos para Task Categories por período
export const taskCategoriesByPeriod = {
  all: [
    { name: 'Social Media', value: 32, color: '#697D67' },
    { name: 'Print', value: 11, color: '#FDB541' },
    { name: 'UI/UX', value: 19, color: '#81A7FF' },
    { name: 'Email Campaign', value: 15, color: '#CEFFA3' },
    { name: 'Content Creation', value: 19, color: '#F01616' },
  ],
  'last-week': [
    { name: 'Social Media', value: 8, color: '#697D67' },
    { name: 'Print', value: 3, color: '#FDB541' },
    { name: 'UI/UX', value: 5, color: '#81A7FF' },
    { name: 'Email Campaign', value: 4, color: '#CEFFA3' },
    { name: 'Content Creation', value: 6, color: '#F01616' },
  ],
  'last-month': [
    { name: 'Social Media', value: 28, color: '#697D67' },
    { name: 'Print', value: 9, color: '#FDB541' },
    { name: 'UI/UX', value: 15, color: '#81A7FF' },
    { name: 'Email Campaign', value: 12, color: '#CEFFA3' },
    { name: 'Content Creation', value: 16, color: '#F01616' },
  ]
};
