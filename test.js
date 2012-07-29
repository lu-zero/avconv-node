var avconv = require('./avconv-node.js');

avconv.mp4(
   './test.3gp',
   function (err, out, code) {
      console.log(err, out, code);
   }
);

