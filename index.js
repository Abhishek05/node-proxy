"use strict"


let http = require('http')
let request = require('request')
let path = require('path')
let fs = require('fs')
let argv = require('yargs').default('host', '127.0.0.1').argv
let scheme = 'http://'
let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)
let destinationUrl = argv.url || scheme  + argv.host + ':' + port
let logPath = argv.log && path.join(__dirname, argv.log)
let getLogStream = ()=> logPath ? fs.createWriteStream(logPath) : process.stdout
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

http.createServer((req, res) => {

    destinationUrl = (req.headers['x-destination-url'] !== undefined) ? req.headers['x-destination-url'] : destinationUrl 
    // Proxy code
    let options = {
        headers: req.headers,
        url: `${destinationUrl}${req.url}`
    }
    options.method = req.method
    
    let downstreamResponse = req.pipe(request(options))
    process.stdout.write(JSON.stringify(downstreamResponse.headers))
//    downstreamResponse.pipe(process.stdout)
    req.pipe(logStream, {end: false})
//  req.pipe(getLogStream())
    logStream.write('Request headers: ' + JSON.stringify(req.headers))
    downstreamResponse.pipe(res)
    
//    req.pipe(request(options)).pipe(res)
//    request(options)
}).listen(8001)
