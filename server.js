/****************** Require in libraries, global variables ***********/
// File System methods: https://nodejs.org/api/fs.html
var fs = require('fs');

// HTTP methods: https://nodejs.org/api/http.html
var http = require('http');

// URL methods: https://nodejs.org/api/url.html
var url = require('url');

// Query String methods: https://nodejs.org/api/querystring.html
var qs = require('querystring');

// Will be an array of element names.
var elements = null;



/******************** Server Request **********************************/

fs.readdir('./public', function (err, files) {
  if(err) {
    res.statusCode = 500;
    res.statusMessage = "Could not GET...";
    return res.end();
  }
  console.log('All files: ', files);
  // Isolate 'element' files based upon '.html' suffix.
  elements = files
    .filter(function(file) {
      return (file.indexOf('.html') > -1 && file !== 'index.html');
    })
    .map(function(fileName) {
      return fileName.substring(0, fileName.indexOf('.html'));
    });
  console.log('Elements: ', elements);
});

/******************** Create Server **********************************/

var server = http.createServer(function requestHandler (req, res) {
  // Need empty variable to store req data in.
  var dataBuffer = '';

  // What to do with the data sent with server request.
  req.on('data', function (data) {
    dataBuffer += data;
  });

  // What to do when the server request has ended.
  req.on('end', function() {
    // 'qs.parse()' renders the parameter (e.g. url key/value pairs) as a clean object.
    var data = qs.parse(dataBuffer.toString());

    // Deal with incoming data.
    switch (req.method.toUpperCase()) {

      /********************** POST Request *************************/
      // Create new .html based upon posted elementName

      // Look up writeIndex() and dataBuild()

      case 'POST':
        var stringifiedData = JSON.stringify(data);
        if (req.url === '/elements') {
          fs.writeFile('public' + data.elementName + '.html', pageBuild(data), function (err) {
            if (err) {
              res.statusCode = 500;
              res.statusMessage = "Could not POST...";
              return res.end();
            }
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'success': true
            });
            res.end();
            console.log('Data has been stored');

            // If the Post Req elementName is not in the directory of elements, add it to the directory
            if(elements.indexOf(data.elementName) === -1) {
              elements.push(data.elementName);
            }
            console.log(elements);
          });
        }
      break;


      // var result = {};
      // req.on('data', function (data) {
      //   var body = parseBody(data);
      //   result.name = body.name;


        //
        //   return true;// create new webpage
        // });
      // req.on('end', function () {
      //   fs.readFile('datastore.json', function (err, data) {
      //     data = data.toString();
      //     if (err) {
      //       res.statusCode = 500;
      //       res.statusMessage = "Something went wrong...";
      //       return res.end();
      //     }

      //     if (!data) {
      //       data = [];
      //     } else {
      //       data = JSON.parse(data);
      //     }

      //     data.push(result);
      //     var stringifiedData = JSON.stringify(data);
      //     fs.writeFile('datastore.json', stringifiedData, function (err) {
      //       if (err) {
      //         res.statusCode = 500;
      //         res.statusMessage = "Something went wrong...";
      //         return res.end();
      //       }
      //     });
      //     res.end(stringifiedData);
      //   });
      // });
      // break;

      /********************** GET Request *************************/
      case 'GET':
        // If empty request, send to default page (index.html).
        if (req.url === '/') {
          fs.readFile('/index.html', function (err, data) {
            res.statusCode = 500;
            res.statusMessage = "Could not POST...";
            return res.end();
          });
        // If specific request, get that page. If no page, return 404 error.
        } else {
          fs.readFile('public' + req.url, function (err, data) {
            if (err) {
              console.error(err);
              fs.readFile('public/404.html', function (err, rawbuffer) {
                if (err) {
                  res.statusCode = 500;
                  res.statusMessage = "Could not POST...";
                  return res.end();
                }
                res.end(rawbuffer);
              });
              res.statusCode = 404;
              res.statusMessage = "Could not GET " + req.url;
              return res.end();
            }

            return res.end(data.toString());
          });
        }
      break;
    }
  });
});


// Server needs to listen.
server.listen(8080, function () {
  console.log('Listening at: localhost:' + 8080);
});

/******************* Miscellaneous Functions ***********************/

function pageBuild(data) {
  return '<html lang="en">' +
      '<head>' +
        '<meta charset="UTF-8">' +
        '<title> The Elements -' + data.elementName + '</title>' +
        '<link rel="stylesheet" href="/css/styles.css">' +
      '</head>' +
      '<body>' +
        '<ul>' +
          '<li>Element Name: ' + data.elementName + '</li>' +
          '<li>Element Symmbol: ' + data.elementSymbol + '</li>' +
          '<li>Element Atomic Number: ' + data.elementAtomicNumber + '</li>' +
          '<li>Element Description: ' + data.elementDescription + '</li>' +
        '</ul>' +
      '</body>' +
    '</html>';
}