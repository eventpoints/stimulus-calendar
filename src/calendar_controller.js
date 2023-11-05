import { Controller } from '@hotwired/stimulus';
import { Clock } from './Model/Clock.js';
import { Calendar } from './Model/Calendar.js';

export default class extends Controller {
    static targets = [
        'output',
        'backdrop',
        'container',
        'calendar',
        'years',
        'months',
        'hours',
        'minutes',
        'meridiem',
        'days',
    ];

    connect() {
        this.clock = new Clock();
        this.calendar = new Calendar(this.clock);
        this.render()
    }

    render(){
        this.renderCalendarYears();
        this.renderCalendarMonths();
        this.renderCalendarDays();
        this.renderHourOptions()
        this.renderMinuteOptions()
        this.renderMeridiems()
    }


    setYear(event) {
        const selectedYear = event.target.getAttribute('data-year');
        this.clock.selectedDate.year(selectedYear);
        this.updateOutput();
    }

    setMonth(event) {
        const selectedMonth = event.target.getAttribute('data-month');
        this.clock.selectedDate.month(selectedMonth);
        this.updateOutput();
    }

    setDay(event) {
        const selectedDate = event.target.getAttribute('data-date');
        this.clock.selectedDate.date(parseInt(selectedDate, 10));
        this.updateOutput();
    }

    setHour(event) {
        const selectedHour = event.target.getAttribute('data-hour');
        this.clock.selectedDate.hours(parseInt(selectedHour, 10), this.getMeridiem() === 'PM');
        this.updateOutput();
    }

    setMinute(event) {
        const selectedMinute = event.target.getAttribute('data-minute');
        console.log(selectedMinute)
        this.clock.selectedDate.minutes(parseInt(selectedMinute, 10));
        this.updateOutput();
    }

    setMeridiem(event) {
        const selectedMeridiem = event.target.getAttribute('data-meridiem');
        this.updateOutput();
    }

    updateOutput() {
        this.outputTarget.innerHTML = this.clock.selectedDate;
    }

    getMeridiem() {
        return this.meridiemTarget.querySelector('.selected')?.dataset.get('meridiem') || 'AM';
    }

    renderMeridiems() {
        const meridiemOptionsContainer = this.meridiemTarget;
        const meridiemOptions = ['AM', 'PM'];
        meridiemOptionsContainer.innerHTML = '';
        meridiemOptions.forEach(meridiem => {
            const meridiemOption = document.createElement('div');
            meridiemOption.classList.add('_sc_meridiem');
            meridiemOption.setAttribute('data-action', 'click->calendar#setMeridiem');
            meridiemOption.setAttribute('data-meridiem', meridiem);
            meridiemOption.textContent = meridiem;
            meridiemOptionsContainer.appendChild(meridiemOption);
        });
    }

    renderCalendarMonths() {
        const months = this.calendar.months();
        months.forEach(month => {
            const monthElement = document.createElement('div');
            monthElement.classList.add('_sc_month')

            if(month.isCurrentMonth){
                monthElement.classList.add('_sc_current_month')
            }

            monthElement.setAttribute('data-month', month.name)
            monthElement.setAttribute('data-action', 'click->calendar#setMonth')
            monthElement.textContent = month.name;
            this.monthsTarget.appendChild(monthElement)
        })
    }

    renderCalendarYears() {
        const years = this.calendar.years();
        years.forEach(year => {
            console.log(year)
            const yearElement = document.createElement('div');
            yearElement.classList.add('_sc_year')

            if(year.isCurrentYear){
                this.currentYearElement = yearElement
                yearElement.classList.add('_sc_current_year')
            }

            yearElement.setAttribute('data-year', year.year)
            yearElement.setAttribute('data-action', 'click->calendar#setYear')
            yearElement.textContent = year.year;
            this.yearsTarget.appendChild(yearElement)
        })



        const elementRect = this.currentYearElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const offset = (elementRect.left + elementRect.right - viewportWidth) / 2;

        this.yearsTarget.scrollBy({ left: offset, behavior: "smooth" });
    }

    renderCalendarDays() {
        const days = this.calendar.days();
        this.daysTarget.innerHTML = '';
        days.forEach(day => {
                const dayElement = document.createElement('div');
                dayElement.setAttribute('data-action', 'click->calendar#setDay')
                dayElement.setAttribute('data-date', day.date)

                dayElement.classList.add('_sc_day')
                dayElement.textContent = day.day;

                if (day.isCurrentDate) {
                    dayElement.classList.add('_sc_current_date');
                }

                this.daysTarget.appendChild(dayElement);
        });
    }


    renderHourOptions() {
        for (let hour = 1; hour <= 12; hour++) {
            const hourOption = document.createElement('div');
            hourOption.classList.add('_sc_hour');
            hourOption.setAttribute('data-action', 'click->calendar#setHour')
            hourOption.dataset.hour = String(hour).padStart(2, '0');
            hourOption.setAttribute('data-hour', `${hour}`);
            hourOption.textContent = hour;
            this.hoursTarget.appendChild(hourOption);
        }
    }


    renderMinuteOptions() {
        const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
        minutes.forEach(minute => {
            const minuteOption = document.createElement('div');
            minuteOption.classList.add('_sc_minute');
            minuteOption.setAttribute('data-action', 'click->calendar#setMinute')
            minuteOption.setAttribute('data-minute', minute)
            minuteOption.textContent = minute;
            this.minutesTarget.appendChild(minuteOption);
        })
    }


    open() {
        this.backdropTarget.style.display = 'block';
        this.containerTarget.style.display = 'block';
    }

    close() {
        this.backdropTarget.style.display = 'none';
        this.containerTarget.style.display = 'none';
    }
}
