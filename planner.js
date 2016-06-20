
var Queue = require('./Queue.js');

/*
  This should plan the schedules, given some candidate classes.
*/

/* finds the intersection of 
 * two arrays in a simple fashion.  
 *
 * params must already be sorted
 * from http://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
 */
function intersect_safe(a, b)
{
    var ai=0, bi=0;
    var result = [];

    while( ai < a.length && bi < b.length )
    {
        if      (a[ai] < b[bi] ){ ai++; }
        else if (a[ai] > b[bi] ){ bi++; }
        else /* they're equal */
        {
            result.push(a[ai]);
            ai++;
            bi++;
        }
    }

    return result;
}

function timeToMinutes(time) {
    var s = time.split(':');
    return parseInt(s[0]) * 60 + parseInt(s[1]);
}


function ScheduleTime(days, startTime, endTime) {
    this.days = days.split("").slice();
    this.days.sort();

    this.startTime = timeToMinutes(startTime);
    this.endTime = timeToMinutes(endTime);

    this.overlaps = function(b) {
        var days = intersect_safe(this.days, b.days);
        if(days.length == 0) {
            return false;
        } else {
            return (this.startTime <= b.endTime) && (b.startTime <= this.endTime);
        }
    };
}

function schedulesOverlap(a, b) {
    return a.overlaps(b);
}

// var x = new ScheduleTime("MWF", "10:00", "12:29");
// var y = new ScheduleTime("WF", "10:30", "12:29");
// var z = new ScheduleTime("R", "10:30", "12:29");
// var a = new ScheduleTime("R", "14:30", "15:29");

// constraints
// [class, class, class], find a time for each class
// {0: .., 1: ..., x: ..}, pick only one section out of 0, 1, .., x
// {LEC: [...], DIS: [...]}, pick exactly one of each in LEC, DIS, ...


function classSections(classes) {
    var out = [];

    for(var i = 0; i < classes.length; i += 1) {
        var sections = classes[i]['data']['sections'];
        out.push(sections);
    }
    console.log(out);
    return out;
}

function proposePossible(classes) {
    if(classes.length == 0) {
        return [];
    }

    // state is (visited, next_index)
    
    var possible = [];
    
    var q = new Queue();

    var state = [[], 0];
    q.enqueue(state);

    while(!q.isEmpty()) {
        state = q.dequeue();
        var visited = state[0].slice();
        var ix = state[1];
        if(ix >= classes.length) {
            possible.push(visited);
            continue;
        }

        var sections = classes[ix];
        for(var section in sections) {
            var sec = sections[section];
            // need to pick one of each
            // TODO:
            // write function that lists possibilities, given visited so far (exclude overlapping times)
            // add each possibility to visited, and add in queue
        }
    }
    
    
}

module.exports = {
    convertToConstraint: classSections
};
