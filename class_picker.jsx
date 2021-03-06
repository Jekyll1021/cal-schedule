import React, { Component } from "react"
import { Link } from "react-router"

import Select from 'react-virtualized-select'
require('react-virtualized/styles.css')
require('react-select/dist/react-select.css')
require('react-virtualized-select/styles.css')

import { storeCookieData } from './session_manager.js'
import { FeedbackButton } from './feedback.jsx'

class ClassList extends Component {
    constructor(props) {
        super(props)
        this.checkItem = this.checkItem.bind(this)
        this.removeItem = this.removeItem.bind(this)
    }

    checkItem(e) {
        const target = $(e['target'])
        const value = target.attr('value')

        window.store.dispatch({
            type: 'TOGGLE_COURSE',
            id: value
        })
        storeCookieData()
    }

    removeItem(e) {
        const target = $(e['target'])
        const value = target.attr('name')
        console.log(value)
        
        window.store.dispatch({
            type: 'REMOVE_COURSE',
            id: value
        })
        storeCookieData()
    }

    render() {
        const items = this.props.items.map(item => {
            const d = item['course']['data']['info']
            const value = item['id']
            const title = `${d['Subject']} ${d['Catalog Number']}`
            const name = d['Course Title']
            const checked = item['selected']

            const url = `/class/${value.replace(' ', '-')}`

            return (
                <div key={value}>
                  <input className="CheckClass"
                         type="checkbox" value={value}
                         checked={checked} onChange={this.checkItem}/>
                  <span className="ClassTitle">
                    <span>{title} &mdash; {name}</span> <Link to={url}>(sections)</Link>
                    <span className="ClassX" onClick={this.removeItem} name={value}> x </span>
                  </span>
                </div>
            )
        })

        return (
            <div className="ClassList">
              <div className="ClassListHeader"> Classes </div>
              <div>
                {items}
              </div>
            </div>
        )
    }
}

export class ClassPicker extends Component {

    constructor(props) {
        super(props)
        this.updateOptions(window.data)
        this.onChange = this.onChange.bind(this)
    }

    componentDidMount() {
        this.unsubscribe = window.store.subscribe(() => this.forceUpdate())

        $('#generate').click(this.props.onGenerate)
    }

    componentWillUnmount() {
        this.unsubscribe()
    }

    onChange(val) {
        if(val == null) {
            return
        }

        window.store.dispatch({
            type: 'ADD_COURSE',
            course: val,
            id: val['value']
        })
        storeCookieData()
    }

    updateOptions(data) {
        const options = []
        const rows = Object.keys(data)

        for(let i=0; i < rows.length; i += 1) {
            const d = data[rows[i]]['info']
            const title = `${d['Subject']} ${d['Catalog Number']}`
            const option = {value: rows[i], label: title, data: data[rows[i]]}
            options.push(option)
        }

        this.options = options
    }

    render() {
        const options = this.options
        const state = window.store.getState()

        return (
            <div className="ClassPicker">
              <Select value={undefined}
                      options={options}
                      onChange={this.onChange}
                      className="ClassSelect"
                      />
              <FeedbackButton/>
              <ClassList items={state.courses.picked}  />
              <div className="btn" id="generate">Generate schedules!</div>
            </div>
        )
    }
}
