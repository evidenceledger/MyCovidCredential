// **************************************************
// Logging and error management
// **************************************************


// Logging level (if false, only log Errors)
const LOG_ALL = true

// Basic persistent rotating log on top of IndexedDB
const MAX_LOG_ENTRIES = 1000

class Warning extends Error {
    constructor(...params) {
      // Pass remaining arguments (including vendor specific ones) to parent constructor
      super(...params)
  
      // Maintains proper stack trace for where our error was thrown (only available on V8)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, Warning)
      }
  
      this.name = 'Warning'
    }
  }

async function mylog_entry(_level, _desc, ...additional) {
    return;
}

export async function mywarn(_desc, ...additional) {
    if (LOG_ALL) {
        let msg = _desc
        // Get the stack trace if available
        try {
            let e = new Warning(_desc)
            msg = e.stack
        } catch {}
        console.warn(_desc, ...additional)
        mylog_entry("W", msg, ...additional)
    }
}

export async function myerror(_desc, ...additional) {
    let msg = _desc
    // Get the stack trace if available
    try {
        let e = new Error(_desc)
        msg = e.stack
    } catch {}

    console.error(msg, ...additional)
    mylog_entry("E", msg, ...additional)
}

export async function recentLogs() {
    return undefined;
    // var rlogs = await db.logs.reverse().limit(200).toArray()
    // return rlogs
}

// Clears the logs table, preserving the other tables
export async function clearLogs() {
    return;
    // await db.logs.clear()
    // alert("Logs cleared")
    // // Reload application in the same page
    // location.reload()
}

export var log = {
    mywarn: mywarn,
    myerror: myerror,
    recentLogs: recentLogs,
    clearLogs: clearLogs,
};

