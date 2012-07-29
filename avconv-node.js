
/**
 * Module to drive avconv video enconding library with shortcuts
 * for web video. Requires an avconv compiled with support for mp4/ogg/webm.
 */

var path = require('path'),
    spawn = require('child_process').spawn,
    that = this,
    queue = [],
    maxActive = 5, // Maximum of active avconv jobs
    active = 0;


// The queue is limited to a max. of 5 active avconv processes.


function push (job) {
   queue.push(job);
   if(active < maxActive) {
      next();
   }
}

function next () {
   if(queue.length > 0 && active < maxActive) {
      console.log(queue[0]);
      that.exec(queue[0].params, queue[0].callback);
      active++;
      queue.shift();
   }
}



/**
 * Description:
 *    calls avconv with the specified flags and returns the output
 *    to the callback function.
 *
 * Parameters:
 * params - an array of avconv options, ex: ['-i','./test.3gp']
 * callback - a function to call when avconv is done, ex:
 *    function (stderr, stdout, exitCode) { ... }
 */

exports.exec = function (params, callback) {
   console.log(params, callback);

   if (params instanceof Array && params.length > 2) {

      var stderr = '', stdout = '',
         avconv = spawn('avconv', params);

      avconv.stderr.on('data', function (err) {
         stderr += err;
      });

      avconv.stdout.on('data', function (output) {
         stdout += output;
      });

      avconv.on('exit', function (code) {
         callback(stderr, stdout, code);
         active--;
         next();
      });

   }

};


/**
 * Description:
 *    serves as middle man for convenience method, required to
 *    avoid code repetition.
 *
 * Parameters:
 * type - one of 'mp4', 'ogg', 'webm', 'mp3', 'm4a' as a string.
 * file - path/to/the/inputFile.ext as a string.
 * params - an array of avconv options to be added to the predefined ones (optional).
 * output - path/to/the/outputFile.ext as a string (optional).
 * callback - function to call when avconv is done, ex:
 *    function (stderr, stdout, exitCode) { ... }
 */


exports.convert = function (/* overloaded */) {

   var type = arguments[0], file = arguments[1],
      params = [], output = '', callback = false;

   if (arguments.length === 3) {
      params = [],
      output = path.dirname(file) +'/'+ path.basename(
         file, path.extname(file)) +'.'+ type,
      callback = arguments[2];
   }
   else if (arguments.length > 3) {
      var err = false;

      if (arguments[2] instanceof Array &&
         typeof arguments[3] === 'string' &&
         arguments[4] instanceof Function) {

         params = arguments[2];
         output = arguments[3];
         callback = arguments[4];
      }
      else if (arguments[2] instanceof Array &&
         arguments[3] instanceof Function) {

         params = arguments[2];
         callback = arguments[3];
      }
      else if (typeof arguments[2] === string &&
         arguments[3] instanceof Function) {

         output = arguments[2];
         callback = arguments[3];
      }
      else if (arguments[2] instanceof Function)
         callback = arguments[2];
      else
         throw new Error("Couldn't parse arguments");

   }
   else
      throw new Error('Not enough arguments');

   switch(type) {
      case 'mp4':
         params = [
            '-i', file,
            '-c:a', 'libvo_aacenc',
            '-ab', '128k',
            '-ar', '48k',
            '-c:v', 'libx264',
            '-tune', 'film',
            '-preset', 'slow',
            '-y', output
         ].concat(params);
      break;

      case 'ogg':
         params = [
            '-i', file,
            '-c:a', 'libvorbis',
            '-ab', '128k',
            '-c:v', 'libtheora',
            '-y', output
         ].concat(params);
      break;

      case 'webm':
         params = [
            '-i', file,
            '-c:a', 'libvorbis',
            '-ab', '128k',
            '-c:v', 'libvpx',
            '-deadline', 'best',
            '-y', output
         ].concat(params);
      break;

      case 'mp3':
         params = [
            '-i', file,
            '-c:a', 'libmp3lame',
            '-ab', '128k',
            '-ar', '48k',
            '-y', output
         ].concat(params);
      break;

      case 'm4a':
         params = [
            '-i', file,
            '-c:a', 'libvo_aacenc',
            '-ab', '64k',
            '-ar', '48k',
            '-y', output
         ].concat(params);
      break;
   }


   push({params: params, callback: callback});

};

/**
 * Description:
 *    Convenience methods to convert to popular web formats (flash/html5)
 *    If you know how to improve these default options, let me know.
 *
 * Parameters:
 * file - path/to/the/inputFile.ext as a string.
 * params - an array of avconv options to be added to the predefined ones (optional).
 * output - path/to/the/outputFile.ext as a string (optional).
 * callback - function to call when avconv is done, ex:
 *    function (stderr, stdout, exitCode) { ... }
 */

exports.mp4 = function (/* overloaded */) {

   var unshift = Array.prototype.unshift;
   unshift.call(arguments, 'mp4');

   this.convert.apply(this, arguments);

};

exports.ogg = function (/* overloaded */) {

   var unshift = Array.prototype.unshift;
   unshift.call(arguments, 'ogg');

   this.convert.apply(this, arguments);

};

exports.webm = function (/* overloaded */) {

   var unshift = Array.prototype.unshift;
   unshift.call(arguments, 'webm');

   this.convert.apply(this, arguments);

};

exports.mp3 = function (/* overloaded */) {

   var unshift = Array.prototype.unshift;
   unshift.call(arguments, 'mp3');

   this.convert.apply(this, arguments);

};

exports.m4a = function (/* overloaded */) {

   var unshift = Array.prototype.unshift;
   unshift.call(arguments, 'm4a');

   this.convert.apply(this, arguments);

};

