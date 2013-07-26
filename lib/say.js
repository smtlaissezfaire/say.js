/*

Copyright (c) 2010 Marak Squires http://github.com/marak/say.js/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var spawn = require('child_process').spawn
  , child;

var say = exports;

// say stuff, speak
// options:
//   outputFile: filename (without extension)
//   cb will return filename (on os x, this will be filename.aiff, )
exports.speak = function(voice, text, options, callback) {
  var commands,
      pipedData,
      outputFileName;

  if (arguments.length < 2) {
    console.log('invalid amount of arguments sent to speak()');
    return;
  }

  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }

  if (!options) {
    options = {};
  }

  if (process.platform == 'darwin') {
    this.speaker = 'say';

    commands = [ '-v', voice, text ];
    if (options.output) {
      commands.push('-o');
      commands.push(options.output);
      outputFileName = options.output + ".aiff";
    }
  }
  else if (process.platform == 'linux') {
    if (options.output) {
      this.speaker = 'text2wav';
      outputFileName = options.output + '.wav';
      commands = ['-o', outputFileName];
      pipedData = text;
    } else {
      this.speaker = 'festival';
      commands = ['--pipe'];
      pipedData = '(' + voice + ') (SayText \"' + text + '\")';
    }
  }

  var childD = spawn(say.speaker, commands);

  childD.stdin.setEncoding('ascii');
  childD.stderr.setEncoding('ascii');

  if (process.platform == 'linux') {
    childD.stdin.end(pipedData);
  }

  childD.stderr.on('data', function(data){ console.log(data); });
  childD.stdout.on('data', function(data){ console.log(data); });

  childD.addListener('exit', function (code, signal) {
    if (code == null || signal != null) {
      console.log('couldnt talk, had an error ' + '[code: '+ code + '] ' + '[signal: ' + signal + ']');
    }

    // we could do better than a try / catch here
    try {
      callback(null, {
        outputFileName: outputFileName
      });
    } catch(err) {}
  });
}
