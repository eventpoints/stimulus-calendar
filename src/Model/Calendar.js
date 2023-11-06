import { DateTime } from 'luxon';

export class Calendar {
    constructor(clock) {
        this.clock = clock;
        this.date = null;
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
        let selectedDate = null

        const date = DateTime.fromISO(this.clock.currentDate);

        const firstDay = date.startOf('month');
        const lastDay = date.endOf('month');
        const days = [];

        let selectedDateIterator = firstDay.minus({ days: 0 });

        while (selectedDateIterator <= lastDay || days.length < 30) {
            days.push({
                day: selectedDateIterator.day,
                iso: selectedDateIterator.toISO(),
            });
            selectedDateIterator = selectedDateIterator.plus({ days: 1 });
        }

        return days;
    }

    calculateDays() {
        const selectedDate = DateTime.fromObject({
            year: this.clock.selectedDate.year,
            month: this.clock.selectedDate.month,
            day: this.clock.selectedDate.day,
            hour: this.clock.selectedDate.hour,
            minute: this.clock.selectedDate.minute
        });
        this.clock.selectedDate = selectedDate;
        this.clock.currentDate = selectedDate;

        const newDays = this.days();
        return newDays;
    }
}
