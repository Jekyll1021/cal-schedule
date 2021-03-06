import React, { Component } from "react"
import { exportCalendar } from './export_calendar.jsx'

function timeToMinutes(time) {
    const s = time.split(':');
    return parseInt(s[0]) * 60 + parseInt(s[1]);
}

function minutesToTime(total_minutes) {
    const hours = Math.floor(total_minutes / 60)

    let minutes = total_minutes % 60
    minutes = minutes + ''
    while(minutes.length < 2) {
        minutes = '0' + minutes
    }

    return `${hours}:${minutes}`
}

// from colorbrewer2.org
// const COLORS = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462',
//               '#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f'];

const COLORS_BORDER = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#b3b3b3']
const COLORS = ['#b3e2cd','#fdcdac','#cbd5e8','#f4cae4','#e6f5c9','#fff2ae','#f1e2cc','#cccccc']

class Section extends Component {
    render() {
        const {section} = this.props

        const courseTitle = `${section['Subject']} ${section['Catalog Number']}`
        const sectionTitle = `${section["Course Component"]} ${section["Section"]}`
        const facilityTitle = section['Facility']

        return (
            <div className="Section"
                 style={{
                     backgroundColor: section['Color'],
                     borderColor: section['BorderColor'],
                     top: this.props.top + "%",
                     height: this.props.height + "%",
                     position: "absolute"
                 }}>
              <span className="CourseTitle"> {courseTitle} {sectionTitle}</span>
              <div className="FacilityTitle">
                {facilityTitle}
              </div>
            </div>
        )
    }
}

const DAY_TITLE_MAP = {
    'M': 'Mon',
    'T': 'Tue',
    'W': 'Wed',
    'R': 'Thu',
    'F': 'Fri',
    'S': 'Sat'
}

class CalendarDayColumn extends Component {
    getPercentPosition(time, props) {
        let minute = timeToMinutes(time)
        return 100 * (minute - props.minMinute) / (props.maxMinute - props.minMinute)
    }

    render() {
        if(!this.props.hasSaturday && this.props.day == 'S') {
            return <div></div>
        }

        let saturdayClass = 'CalendarDayColumnWithoutSaturday'
        if(this.props.hasSaturday) {
            saturdayClass = 'CalendarDayColumnWithSaturday'
        }

        const courseElements = this.props.sections.map( (section) => {
            const top = this.getPercentPosition(section["Start Time"], this.props)
            const bottom = this.getPercentPosition(section["End Time"], this.props)
            const height = bottom - top

            const title = section['Class Number']

            return <Section key={title} section={section} top={top} height={height} />
        })

        const dayTitle = DAY_TITLE_MAP[this.props.day]

        return (
            <div className={"CalendarDayColumn " + saturdayClass} >
              <div className="CalendarDayTitle"> {dayTitle} </div>
              <div className="CalendarDaySections">
                {courseElements}
              </div>
            </div>
        );
    }
}

class CalendarTimeColumn extends Component {
    getPercentPosition(minute, props) {
        return 100 * (minute - props.minMinute) / (props.maxMinute - props.minMinute)
    }

    render() {
        let { minMinute, maxMinute } = this.props

        let elements = []

        for(let minute = minMinute; minute <= maxMinute; minute += 60) {
            const time = minutesToTime(minute)
            const top = this.getPercentPosition(minute, this.props)
            elements.push(
                <div className="CalendarTimeLabel" key={time} style={{top: top + '%'}}>
                  {time}
                </div>
            )
        }


        return (
            <div className="CalendarTimeColumn">
              <div className="CalendarDayTitle"> </div>
              <div className="CalendarTimeColumnContent">
                {elements}
              </div>
            </div>
        )
    }
}

class Calendar extends Component {

    getSections(courses) {
        let out = []

        let index = 0;

        for(let course of courses) {
            const color = COLORS[index % COLORS.length]
            const borderColor = COLORS_BORDER[index % COLORS.length]

            for(let section of course) {
                section['Index'] = index
                section['Color'] = color
                section['BorderColor'] = borderColor
                out.push(section)
            }

            index += 1
        }

        return out
    }

    render() {
        const sections = this.getSections(this.props.courses)

        let dayElements = {}

        const days = 'MTWRFS'.split('')
        for(const day of days) {
            dayElements[day] = []
        }

        let minMinute = null;
        let maxMinute = null;

        for(let section of sections) {
            const meetingDays = section['Meeting Days'].split('')

            for(let day of meetingDays) {

                let startMinute = timeToMinutes(section['Start Time'])
                let endMinute = timeToMinutes(section['End Time'])

                if(minMinute === null || startMinute < minMinute) {
                    minMinute = startMinute
                }
                if(maxMinute === null || endMinute > maxMinute) {
                    maxMinute = endMinute
                }

                dayElements[day].push(section)
            }
        }

        maxMinute = maxMinute + 32

        minMinute = minMinute - (minMinute % 60)
        maxMinute = maxMinute - (maxMinute % 60)

        let hasSaturday = false
        if(dayElements['S'].length > 0) {
            hasSaturday = true
        }

        let dayColumns = days.map( (day) => {
            return (
                <CalendarDayColumn key={day} day={day} hasSaturday={hasSaturday}
                                   sections={dayElements[day]}
                                   minMinute={minMinute} maxMinute={maxMinute}
                                   />
            )
        })

        return (
            <div className="Calendar">
              <CalendarTimeColumn minMinute={minMinute} maxMinute={maxMinute} />
              {dayColumns}
            </div>
        )
    }
}

class CalendarPicker extends Component {
    render() {
        const { numCalendars, selected, calendar } = this.props

        return (
            <div className="CalendarPicker">
              <div className="CalendarNumber">
                Calendar {selected+1}/{numCalendars}
              </div>
              <div className="CalendarButtons">
                <span className="btn" onClick={() => {
                      window.store.dispatch({
                          type: 'PREV_CALENDAR_INDEX'
                      })
                  }}> Previous </span>
                <span className="btn" onClick={() => {
                      window.store.dispatch({
                          type: 'NEXT_CALENDAR_INDEX'
                      })
                  }}> Next </span>
              </div>
              <div className="ExportButton">
                <span className="btn" id="exportCalendar" onClick={() => {
                      exportCalendar(calendar)
                  }}>Export</span>
              </div>
            </div>
        )
    }
}

export class Calendars extends Component {
    componentDidMount() {
        this.unsubscribe = window.store.subscribe(() => this.forceUpdate())
    }

    componentWillUnmount() {
        this.unsubscribe()
    }

    render() {
        const state = window.store.getState()
        const { calendars, index } = state.calendars

        if(calendars.length == 0) {
            return (
                <div className="Calendars">
                  No possible calendars
                </div>
            )
        }

        const calendar = calendars[index]

        return (
            <div className="Calendars">
              <CalendarPicker numCalendars={calendars.length}
                              selected={index}
                              calendar={calendar} />
              <Calendar courses={calendar} />
            </div>
        )
    }
}

$(document).keydown(function(e) {
    switch(e.which) {
    case 37: // left
        window.store.dispatch({
            type: 'PREV_CALENDAR_INDEX'
        })
        break;

    case 39: // right
        window.store.dispatch({
            type: 'NEXT_CALENDAR_INDEX'
        })
        break;

    case 38: // up
        break;

    case 40: // down
        break;

    default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});
