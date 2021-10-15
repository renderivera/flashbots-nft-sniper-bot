// Constants
const TIMESTAMP_FORMAT = '';
const MIN_LOG = 0;
const LOG_FLAGS = {
    0: 'DEBUG',
    1: 'INFO',
    2: 'ERROR'
}

/**
 * Convenience logging method.
 * @param {string} msg      Message to log
 * @param {object} object   JSON object to log (optional)
 * @param {int} flag        Logging level flag
 */
 function log(msg, object=undefined, flag=1) {
    // Don't log anything below set level
    if(flag < MIN_LOG) {
        return;
    }
    // Format timestamp as dd/mm/yyyy hh:mm:ss.xxx
    let d = new Date();
    let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
    let month = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1);
    let year = d.getFullYear();
    let hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
    let minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
    let seconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
    let millis = d.getMilliseconds() < 10 ? '0' + d.getMilliseconds() : d.getMilliseconds();
    if(d.getMilliseconds() < 100) {
        millis = '0' + millis;
    }

    let timestamp = day + '/' + month + '/' + year;
    timestamp += ' ' + hours + ':' + minutes + ':' + seconds;
    timestamp += '.' + millis;
    // Log message
    if(LOG_FLAGS[flag] == 2) {
        console.error(timestamp + ' [' + LOG_FLAGS[flag] + ']: ' + msg);
    } else {
        console.log(timestamp + ' [' + LOG_FLAGS[flag] + ']: ' + msg);
    }
    // Log JSON object, if any
    if(object !== undefined) {
        console.log(object);
    }
}

module.exports = log;