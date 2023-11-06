import {Controller} from '@hotwired/stimulus';
import {Clock} from './Model/Clock.js';
import {Calendar} from './Model/Calendar.js';
import {DateTime} from 'luxon';

export default class extends Controller {
    static targets = [
        'dateInput',
        'backdrop',
        'container',
        'calendar',
        'years',
        'months',
        'hours',
        'minutes',
        'days',
    ];

    static values = {
        isDisabled: {
            type: Boolean,
            default: false
        }
    }

    connect() {
        this.dateInputTarget.setAttribute('data-action', 'focus->calendar#open')
        this.isDisabled = this.isDisabledValue
        this.renderBackdrop();
        this.renderCalendar();
    }


    async render() {
        this.clock = new Clock();
        this.calendar = new Calendar(this.clock);

        if (this.dateInputTarget.getAttribute('value')) {
            this.clock.selectedDate = DateTime.fromSQL(this.dateInputTarget.value)
        }


        await this.renderCalendarDays();
        await this.renderCalendarYears();
        await this.renderCalendarMonths();
        await this.renderHourOptions();
        await this.renderMinuteOptions();

        if (this.clock.selectedDate) {
            await this.scrollVerticallyTo(this.selectedMinuteElement, this.minutesTarget);
            await this.scrollVerticallyTo(this.selectedHourElement, this.hoursTarget);
            await this.scrollHorizontallyTo(this.selectedMonthElement, this.monthsTarget);
            await this.scrollHorizontallyTo(this.selectedYearElement, this.yearsTarget);
        } else {
            await this.scrollVerticallyTo(this.currentMinuteElement, this.minutesTarget);
            await this.scrollVerticallyTo(this.currentHourElement, this.hoursTarget);
            await this.scrollHorizontallyTo(this.currentMonthElement, this.monthsTarget);
            await this.scrollHorizontallyTo(this.currentYearElement, this.yearsTarget);
        }

    }


    async setYear(event) {
        const year = parseInt(event.target.getAttribute('data-year'), 10);

        this.calendar.clock.selectedDate = DateTime.fromObject({
            year,
            month: this.calendar.clock.currentDate.month,
            day: this.calendar.clock.currentDate.day,
            hour: this.calendar.clock.currentDate.hour,
            minute: this.calendar.clock.currentDate.minute,
        });

        await this.renderCalendarYears();
        this.updateOutput();
    }

    async setMonth(event) {
        const month = parseInt(event.target.getAttribute('data-month'), 10);

        this.calendar.clock.selectedDate = DateTime.fromObject({
            year: this.calendar.clock.currentDate.year,
            month,
            day: this.calendar.clock.currentDate.day,
            hour: this.calendar.clock.currentDate.hour,
            minute: this.calendar.clock.currentDate.minute,
        });
        await this.renderCalendarMonths();
        this.updateOutput();
    }

    async setDay(event) {
        const iso = event.target.getAttribute('data-day-iso');
        let date = DateTime.fromISO(iso)

        this.calendar.clock.selectedDate = DateTime.fromObject({
            day: date.day,
        });


        event.target.classList.add('_sc_selected_date')
        const newDays = this.calendar.calculateDays();
        await this.renderCalendarDays(newDays);
        this.updateOutput();
    }

    async setHour(event) {
        const selectedHour = event.target.getAttribute('data-hour');

        this.calendar.clock.selectedDate = DateTime.fromObject({
            year: this.calendar.clock.currentDate.year,
            month: this.calendar.clock.currentDate.month,
            day: this.calendar.clock.currentDate.day,
            hour: parseInt(selectedHour, 10),
            minute: this.calendar.clock.currentDate.minute,
        });

        await this.renderHourOptions();

        this.updateOutput();
    }

    async setMinute(event) {
        const selectedMinute = event.target.getAttribute('data-minute');

        this.calendar.clock.selectedDate = DateTime.fromObject({
            year: this.calendar.clock.currentDate.year,
            month: this.calendar.clock.currentDate.month,
            day: this.calendar.clock.currentDate.day,
            hour: this.calendar.clock.currentDate.hour,
            minute: parseInt(selectedMinute, 10),
        });

        await this.renderMinuteOptions();
        this.updateOutput();
    }


    updateOutput() {
        this.dateInputTarget.setAttribute('value', this.clock.selectedDate.toISO())
    }

    async renderCalendarMonths() {
        this.monthsTarget.innerHTML = '';
        const months = this.calendar.months();
        months.forEach(month => {
            const monthElement = document.createElement('div');
            monthElement.classList.add('_sc_month');

            monthElement.setAttribute('data-month', month.monthNumber);
            if (!this.isDisabled) {
                monthElement.setAttribute('data-action', 'click->calendar#setMonth');
            }
            monthElement.textContent = month.name;

            if (month.isCurrentMonth) {
                this.currentMonthElement = monthElement
                monthElement.classList.add('_sc_current_month');
            }


            if (this.clock.selectedDate instanceof DateTime && this.clock.selectedDate.month === month.monthNumber) {
                this.selectedMonthElement = monthElement
                monthElement.classList.add('_sc_selected_month');
            }

            this.monthsTarget.appendChild(monthElement);
        });

    }

    async renderCalendarYears() {
        this.yearsTarget.innerHTML = '';
        const years = this.calendar.years();
        years.forEach(year => {
            const yearElement = document.createElement('div');
            yearElement.classList.add('_sc_year');

            if (year.isCurrentYear) {
                this.currentYearElement = yearElement;
                yearElement.classList.add('_sc_current_year');
            }

            if (this.clock.selectedDate instanceof DateTime && this.clock.selectedDate.year === year.year) {
                this.selectedYearElement = yearElement;
                yearElement.classList.add('_sc_selected_year');
            }

            yearElement.setAttribute('data-year', year.year);
            if (!this.isDisabled) {
                yearElement.setAttribute('data-action', 'click->calendar#setYear');
            }
            yearElement.textContent = year.year;
            this.yearsTarget.appendChild(yearElement);
        });
    }

    async renderCalendarDays() {
        const days = this.calendar.days();
        this.daysTarget.innerHTML = '';
        days.forEach(day => {
            const dayElement = document.createElement('div');
            if (!this.isDisabled) {
                dayElement.setAttribute('data-action', 'click->calendar#setDay');
            }
            dayElement.setAttribute('data-day', day.day);
            dayElement.setAttribute('data-day-iso', day.iso);

            dayElement.classList.add('_sc_day');
            dayElement.textContent = day.day;

            if (this.clock.currentDate.day === DateTime.fromISO(day.iso).day) {
                dayElement.classList.add('_sc_current_date');
            }

            if (this.clock.selectedDate instanceof DateTime && this.clock.selectedDate.day === DateTime.fromISO(day.iso).day) {
                dayElement.classList.add('_sc_selected_date');
            }

            this.daysTarget.appendChild(dayElement);
        });
    }

    async renderHourOptions() {

        this.hoursTarget.innerHTML = '';

        for (let hour = 1; hour <= 23; hour++) {
            const hourOptionElement = document.createElement('div');
            hourOptionElement.classList.add('_sc_hour');
            if (!this.isDisabled) {
                hourOptionElement.setAttribute('data-action', 'click->calendar#setHour');
            }
            hourOptionElement.setAttribute('data-hour', hour);

            if (this.clock.currentDate.hour === hour) {
                this.currentHourElement = hourOptionElement
                hourOptionElement.classList.add('_sc_current_hour');
            }

            if (this.clock.selectedDate instanceof DateTime && this.clock.selectedDate.hour === hour) {
                this.selectedHourElement = hourOptionElement
                hourOptionElement.classList.add('_sc_selected_hour');
            }

            hourOptionElement.textContent = hour;
            this.hoursTarget.appendChild(hourOptionElement);
        }

    }

    async renderMinuteOptions() {
        this.minutesTarget.innerHTML = '';
        const minutes = Array.from({length: 60}, (_, index) => index);
        minutes.forEach(minute => {
            const minuteOptionElement = document.createElement('div');
            minuteOptionElement.classList.add('_sc_minute');
            if (!this.isDisabled) {
                minuteOptionElement.setAttribute('data-action', 'click->calendar#setMinute');
            }
            minuteOptionElement.setAttribute('data-minute', minute);
            minuteOptionElement.textContent = minute;

            if (this.clock.currentDate.minute === minute) {
                this.currentMinuteElement = minuteOptionElement
                minuteOptionElement.classList.add('_sc_current_minute');
            }

            if (this.clock.selectedDate instanceof DateTime && this.clock.selectedDate.minute === minute) {
                this.selectedMinuteElement = minuteOptionElement
                minuteOptionElement.classList.add('_sc_selected_minute');
            }

            this.minutesTarget.appendChild(minuteOptionElement);
        });

    }

    open() {
        this.backdropTarget.style.display = 'block';
        this.calendarTarget.style.display = 'block';
        this.render();
    }

    close() {
        this.backdropTarget.style.display = 'none';
        this.calendarTarget.style.display = 'none';

        this.clock = null
        this.calendar = null
        this.yearsTarget.innerHTML = '';
        this.monthsTarget.innerHTML = '';
        this.daysTarget.innerHTML = '';
        this.hoursTarget.innerHTML = '';
        this.minutesTarget.innerHTML = '';
    }


    async scrollHorizontallyTo(element, containingElement) {
        const elementRect = element.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const offset = (elementRect.left + elementRect.right - viewportWidth) / 2;
        containingElement.scrollBy({left: offset, behavior: 'smooth'});
    }


    async scrollVerticallyTo(element, containingElement) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const elementRect = element.getBoundingClientRect();
        const containingRect = containingElement.getBoundingClientRect();
        containingElement.scrollBy({
            top: elementRect.top - containingRect.top,
            behavior: 'smooth',
        });
    }

    renderBackdrop() {
        const backdropElement = document.createElement('div');
        backdropElement.classList.add('_sc_backdrop');
        backdropElement.setAttribute('data-calendar-target', 'backdrop');
        backdropElement.setAttribute('data-action', 'click->calendar#close');
        this.element.appendChild(backdropElement);
    }

    renderCalendar() {
        const calendarElement = document.createElement('div');
        calendarElement.classList.add('_sc_calendar');
        calendarElement.setAttribute('data-calendar-target', 'calendar');

        const calendarTimeRow = document.createElement('div');
        calendarTimeRow.classList.add('_sc_calendar_time_row');

        const timePicker = document.createElement('div');
        timePicker.classList.add('_sc_time_picker');

        const hours = document.createElement('div');
        hours.classList.add('_sc_hours');
        hours.setAttribute('data-calendar-target', 'hours');

        const minutes = document.createElement('div');
        minutes.classList.add('_sc_minutes');
        minutes.setAttribute('data-calendar-target', 'minutes');

        const dateContainer = document.createElement('div');
        dateContainer.classList.add('_sc_date_container');

        const years = document.createElement('div');
        years.classList.add('_sc_years');
        years.setAttribute('data-calendar-target', 'years');

        const months = document.createElement('div');
        months.classList.add('_sc_months');
        months.setAttribute('data-calendar-target', 'months');

        const days = document.createElement('div');
        days.classList.add('_sc_days');
        days.setAttribute('data-calendar-target', 'days');

        timePicker.appendChild(hours);
        timePicker.appendChild(minutes);

        dateContainer.appendChild(years);
        dateContainer.appendChild(months);
        dateContainer.appendChild(days);

        calendarTimeRow.appendChild(timePicker);
        calendarTimeRow.appendChild(dateContainer);

        calendarElement.appendChild(calendarTimeRow);

        this.element.appendChild(calendarElement);
    }
}
