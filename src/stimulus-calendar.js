import {Controller} from '@hotwired/stimulus';
import {Calendar} from './Calendar.js';
import {DateTime} from 'luxon';

import './default.css';

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
        this.calendar = new Calendar();
        this.inputDate = this.dateInputTarget.getAttribute('value')
        if (this.inputDate) {
            this.calendar.selectedDate = DateTime.fromSQL(this.inputDate)
        }


        await this.renderCalendarDays();
        await this.renderCalendarYears();
        await this.renderCalendarMonths();
        await this.renderHourOptions();
        await this.renderMinuteOptions();

        if (this.calendar.selectedDate) {
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

        if(!this.calendar.selectedDate){
            this.calendar.selectedDate = DateTime.local();
        }

        const year = parseInt(event.target.getAttribute('data-year'), 10);
        this.selectedYearElement = event.target;

        this.calendar.selectedDate = DateTime.fromObject({
            year: year,
            month: this.calendar.selectedDate.month,
            day: this.calendar.selectedDate.day,
            hour: this.calendar.selectedDate.hour,
            minute: this.calendar.selectedDate.minute,
            second: 0
        });

        await this.renderCalendarYears();
        this.updateOutput();
    }

    async setMonth(event) {

        if(!this.calendar.selectedDate){
            this.calendar.selectedDate = DateTime.local();
        }

        const month = parseInt(event.target.getAttribute('data-month'), 10);
        this.selectedMonthElement = event.target;


        this.calendar.selectedDate = DateTime.fromObject({
            year: this.calendar.selectedDate.year,
            month: month,
            day: this.calendar.selectedDate.day,
            hour: this.calendar.selectedDate.hour,
            minute: this.calendar.selectedDate.minute,
            second: 0
        });


        await this.renderCalendarMonths();
        this.updateOutput();
    }

    async setDay(event) {

        if(!this.calendar.selectedDate){
            this.calendar.selectedDate = DateTime.local();
        }

        const iso = event.target.getAttribute('data-day-iso');
        let date = DateTime.fromISO(iso)

        this.calendar.selectedDate = DateTime.fromObject({
            year: this.calendar.selectedDate.year,
            month: this.calendar.selectedDate.month,
            day: date.day,
            hour: this.calendar.selectedDate.hour,
            minute: this.calendar.selectedDate.minute,
            second: 0
        });

        event.target.classList.add('_sc_selected_date')
        const newDays = this.calendar.calculateDays();
        await this.renderCalendarDays(newDays);
        this.updateOutput();
    }

    async setHour(event) {

        if(!this.calendar.selectedDate){
            this.calendar.selectedDate = DateTime.local();
        }

        const selectedHour = event.target.getAttribute('data-hour');
        this.selectedHourElement = event.target;


        this.calendar.selectedDate = DateTime.fromObject({
            year: this.calendar.selectedDate.year,
            month: this.calendar.selectedDate.month,
            day: this.calendar.selectedDate.day,
            hour: selectedHour,
            minute: this.calendar.selectedDate.minute,
            second: 0
        });

        await this.renderHourOptions();

        this.updateOutput();
    }

    async setMinute(event) {

        if(!this.calendar.selectedDate){
            this.calendar.selectedDate = DateTime.local();
        }

        const selectedMinute = event.target.getAttribute('data-minute');
        this.selectedMinuteElement = event.target;

        this.calendar.selectedDate = DateTime.fromObject({
            year: this.calendar.selectedDate.year,
            month: this.calendar.selectedDate.month,
            day: this.calendar.selectedDate.day,
            hour: this.calendar.selectedDate.hour,
            minute: selectedMinute,
            second: 0
        });

        await this.renderMinuteOptions();
        this.updateOutput();
    }


    updateOutput() {
        this.dateInputTarget.setAttribute('value', this.calendar.selectedDate.toFormat('yyyy-MM-dd HH:mm'))
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


            if (this.calendar.selectedDate instanceof DateTime && this.calendar.selectedDate.month === month.monthNumber) {
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

            if (this.calendar.selectedDate instanceof DateTime && this.calendar.selectedDate.year === year.year) {
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

            if (this.calendar.currentDate.day === DateTime.fromISO(day.iso).day) {
                dayElement.classList.add('_sc_current_date');
            }

            if (this.calendar.selectedDate instanceof DateTime && this.calendar.selectedDate.day === DateTime.fromISO(day.iso).day) {
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

            if (this.calendar.currentDate.hour === hour) {
                this.currentHourElement = hourOptionElement
                hourOptionElement.classList.add('_sc_current_hour');
            }

            if (this.calendar.selectedDate instanceof DateTime && this.calendar.selectedDate.hour === hour) {
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

            if (this.calendar.currentDate.minute === minute) {
                this.currentMinuteElement = minuteOptionElement
                minuteOptionElement.classList.add('_sc_current_minute');
            }

            if (this.calendar.selectedDate instanceof DateTime && this.calendar.selectedDate.minute === minute) {
                this.selectedMinuteElement = minuteOptionElement
                minuteOptionElement.classList.add('_sc_selected_minute');
            }

            this.minutesTarget.appendChild(minuteOptionElement);
        });

    }

    async open() {
        this.backdropTarget.style.display = 'block';
        this.calendarTarget.style.display = 'block';
        await this.render();

        if(this.calendar.selectedDate) {
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

    close() {
        this.backdropTarget.style.display = 'none';
        this.calendarTarget.style.display = 'none';

        this.currentYearElement = null;
        this.currentMonthElement = null;
        this.currentHourElement = null;
        this.currentMinuteElement = null;

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
