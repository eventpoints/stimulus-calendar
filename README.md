# Stimulus Calendar
Date and time input stimulus controller.

### Demo
[Stimulus Calendar Demo](https://gregarious-treacle-078ba8.netlify.app/)

### Installation

`yarn add stimulus-calendar`
`npm install stimulus-calendar`


### Usage

```js
// bootstrap.js
import {Application} from '@hotwired/stimulus'
import Calendar from 'src/stimulus-calendar'

const app = Application.start()
app.register('calendar', Calendar)
```

```html
<div data-controller="calendar" data-calendar-is-disabled-value="false">
    <input type="text" data-calendar-target="dateInput" value="{{ post.date|format_datetime() }}"/>
</div>
```


### Config

- `data-calendar-is-disabled-value="true"` - disables the input to select a year, month, day, hour and minute.

### Themes

- `data-calendar-theme-value="dark"`
- `data-calendar-theme-value="light"`
- `data-calendar-theme-value="default"` (crazy, but this one is default)
