export interface Day {
    date: string;
    dayOfMonth: number;
    isCurrentMonth: boolean;
    isToday?: boolean;
}

export const toISODateString = (dateInput: Date | string | null | undefined): string => {
    if (!dateInput) {
        return '';
    }

    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
        return '';
    }
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString()
        .split("T")[0];
};

export const generateCalendarDays = (date: Date): Day[] => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();

    const days: Day[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // --- Add Padding Days from Previous Month ---
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek; i > 0; i--) {
        const day = prevMonthLastDay - i + 1;
        const prevMonthDate = new Date(year, month - 1, day);
        days.push({
            date: toISODateString(prevMonthDate),
            dayOfMonth: day,
            isCurrentMonth: false,
        });
    }

    // --- Add Days of the Current Month ---
    for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(year, month, i);
        days.push({
            date: toISODateString(currentDate),
            dayOfMonth: i,
            isCurrentMonth: true,
            isToday: currentDate.getTime() === today.getTime(),
        });
    }

    // --- Add Padding Days for the Next Month ---
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
        const nextMonthDate = new Date(year, month + 1, i);
        days.push({
            date: toISODateString(nextMonthDate),
            dayOfMonth: i,
            isCurrentMonth: false,
        });
    }
    
    return days;
};