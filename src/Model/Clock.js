import { DateTime } from 'luxon';

export class Clock {
    constructor() {
        this.currentDate = DateTime.local();
        this.selectedDate = null
    }
}