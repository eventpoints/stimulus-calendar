import { DateTime } from 'luxon';

export class Calendar {


    constructor() {
        this.currentDate = DateTime.local();
        this.selectedDate = null
    }

    years() {
        const now = DateTime.local();
        const currentYear = now.year;
        const previousYears = 100;
        const upcomingYears = 100;
        const years = [];

        for (let i = currentYear - previousYears; i <= currentYear + upcomingYears; i++) {
            years.push({
                year: i,
                isCurrentYear: i === currentYear,
            });
        }

        return years;
    }

    months() {
        const now = DateTime.local();
        const currentYear = now.year;
        const months = [];

        for (let i = 1; i <= 12; i++) {
            const current = DateTime.fromObject({ year: currentYear, month: i, day: 1 });
            months.push({
                name: current.toFormat('MMMM'),
                year: current.year,
                monthNumber: i, // Numeric month number (1-12)
                isCurrentMonth: i === now.month,
            });
        }

        return months;
    }

    days() {

       let date = this.selectedDate ?? this.currentDate
        const datetime = DateTime.fromISO(date);

        // Calculate the first day of the month and the last day of the month
        const firstDay = datetime.startOf('month');
        const lastDay = datetime.endOf('month');

        const days = [];

        // Calculate the offset to align the first day with the correct day of the week
        const offset = firstDay.weekday - 1; // 1 for Monday, 7 for Sunday

        // Add the offset days
        for (let i = 1; i <= offset; i++) {
            days.push({
                isDayOffset: true
            });
        }

        // Add the days of the month
        for (let i = 1; i <= lastDay.day; i++) {
            days.push({
                day: i,
                iso: firstDay.set({ day: i }).toISO(),
            });
        }

        return days;
    }



    calculateDays() {
        if(this.selectedDate) {
            const selectedDate = DateTime.fromObject({
                year: this.selectedDate.year,
                month: this.selectedDate.month,
                day: this.selectedDate.day,
                hour: this.selectedDate.hour,
                minute: this.selectedDate.minute
            });

        }else{
            this.selectedDate = DateTime.local();
        }

        return this.days();
    }
}
