import moment from 'moment';

export class Calendar {
    constructor(clock) {
        this.clock = clock;
        this.date = null;
    }


    years() {
        const now = this.clock.currentDate;
        const currentYear = now.year();
        const previousYears = 100;
        const upcomingYears = 100; // Include the current year and the next 5 years
        const years = [];

        // Generate previous years
        for (let i = currentYear - previousYears; i <= currentYear; i++) {
            years.push({
                year: i,
                isCurrentYear: i === currentYear,
            });
        }

        // Generate upcoming years
        for (let i = currentYear + 1; i <= currentYear + upcomingYears; i++) {
            years.push({
                year: i,
                isCurrentYear: i === currentYear,
            });
        }

        return years;
    }

    months() {
        const now = this.clock.currentDate;
        const currentYear = now.year();
        const currentMonth = now.month();
        const previousMonths = 5;
        const upcomingMonths = 6; // Include the current month and the next 5 months
        const months = [];

        // Generate previous months
        for (let i = currentMonth - previousMonths; i <= currentMonth; i++) {
            const current = now.clone().year(currentYear).month(i);
            months.push({
                name: current.format('MMMM'),
                year: current.year(),
                isCurrentMonth: i === currentMonth,
            });
        }

        // Generate upcoming months
        for (let i = currentMonth + 1; i <= currentMonth + upcomingMonths; i++) {
            const current = now.clone().year(currentYear).month(i);
            months.push({
                name: current.format('MMMM'),
                year: current.year(),
                isCurrentMonth: i === currentMonth,
            });
        }

        return months;
    }


    days() {
        const now = this.clock.currentDate;
        const year = now.year;
        const month = now.month;
        const firstDay = now.clone().startOf('month');
        const lastDay = now.clone().endOf('month');

        // Generate the previous 5 days
        let currentDate = firstDay.clone().subtract(5, 'days');

        const days = [];

        while (currentDate.isBefore(firstDay, 'day')) {
            days.push({
                day: currentDate.date(),
                date: currentDate.format('YYYY-MM-DD'),
                isCurrentDate: false,
                isSelectedDate: false,
            });
            currentDate.add(1, 'day');
        }

        // Generate days for the current month and next 30 days
        currentDate = firstDay.clone();

        while (currentDate.isSameOrBefore(lastDay, 'day') || days.length < 35) {
            days.push({
                day: currentDate.date(),
                date: currentDate.format('YYYY-MM-DD'),
                isCurrentDate: currentDate.isSame(now, 'day'),
                isSelectedDate: currentDate.format('YYYY-MM-DD') === this.date,
            });

            currentDate.add(1, 'day');
        }

        return days;
    }
}
