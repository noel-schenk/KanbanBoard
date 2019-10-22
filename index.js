let http = require('http')
let url = require('url')
let fs = require('fs')
let path = require('path');
let mime = require('mime');

//really insecure and simple server use just for testing

http.createServer((request, response)=>{
    let resolve;
    if(request.url == '/'){
        resolve = path.resolve('.') + '/dist/html' + '/index.html';
    }else{
        resolve = path.resolve('.') + '/dist' + request.url;
    }
    fs.access(resolve, fs.F_OK, (err) => {
        if(err){
            return
        }
        response.writeHead(200, {
            'Content-Type': mime.getType(resolve),
            'Cache-Control': 'max-age=60'
          });
        fs.createReadStream(resolve).pipe(response);
    });
}).listen(3685);