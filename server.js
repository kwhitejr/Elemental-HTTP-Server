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
      return (file.indexOf('.html') > -1 && file !== 'index.html' && file !== '404.html');
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

      case 'POST':
        // Check if post is made to correct root and if that element already exists.
        if (req.url === '/elements' && elements.indexOf(data.elementName) === -1) {
          // Write to new html file based upon element name and 'pageBuild()' function
          fs.writeFile('./public/' + data.elementName + '.html', pageBuild(data), function (err) {

            // Error condition
            if (err) {
              res.statusCode = 500;
              res.statusMessage = "Could not POST...";
              return res.end();
            }

            // Followed directions, but what does this do?
            res.writeHead(200, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              'success': true
            }));
            console.log('Data has been stored');

            // If the Post Req elementName is not in the directory of elements, add it to the directory
            if(elements.indexOf(data.elementName) === -1) {
              elements.push(data.elementName);
              console.log(elements);
              updateIndex(data.elementName);
            }
          });
          console.log('New elements array: ', elements);
        } else {
          console.log('That URL already exists');
        }
      break;

      /********************** GET Request *************************/
      case 'GET':
        // If empty request, send to default page (index.html).
        if (req.url === '/') {
          fs.readFile('public/index.html', 'utf8', function (err, data) {

            // Error condition
            if (err) {
              res.statusCode = 500;
              res.statusMessage = "Could not load index...";
            }

            // Return the index.html data.
            return res.end(data);
          });
        // If specific request, get that page. If no page, return 404 error.
        } else {
          fs.readFile('public' + req.url, 'utf8', function (err, data) {

            // Error condition
            if (err) {
              res.statusCode = 404;
              res.statusMessage = "Could not GET " + req.url;
              return fs.readFile('./public/404.html', 'utf8', function (err, rawbuffer) {
                return res.end(rawbuffer);
              });
            }
            // (else) Return the data, i.e. the requested url.
            return res.end(data);
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

// A function to build a new page based upon POST data.
function pageBuild(data) {
  return '<html lang="en">' +
      '<head>' +
        '<meta charset="UTF-8">' +
        '<title> The Elements -' + data.elementName + '</title>' +
        '<link rel="stylesheet" href="/css/styles.css">' +
      '</head>' +
      '<body>' +
        '<h1>' + data.elementName + '</h1>' +
        '<h2>' + data.elementSymbol + '</h2>' +
        '<h3>' + data.elementAtomicNumber + '</h3>' +
        '<p>' + data.elementDescription + '</p>' +
        '<p><a href="/">back</a></p>' +
      '</body>' +
    '</html>';
}

// A function to update index.html to reflect newly added element page.
function updateIndex(element) {
  // The new end to index.html
  var li = "<li><a href='/" +element+ ".html'>" +element+ "</a></li></ol></body></html>";
  // fs.readFile gets index.html in string form
  fs.readFile('./public/index.html', 'utf8', function (err, data) {
    if (err)
      console.log(err);
    // fd (File Descriptor) gets the file to be written to for 'fs.write'.
    var fd = fs.openSync('./public/index.html', 'r+');
    // Overwrites the 'fd' with 'li' beginning at position.
    fs.write(fd, li, data.lastIndexOf('</li>')+5, 'utf8', function (err) {
      if (err) {
        res.statusCode = 500;
        res.statusMessage = "Could not POST...";
        return res.end();
      }
    });
  });
}

