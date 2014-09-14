var hybrid = require('../');
var test = require('tape');
var fs = require('fs');
var concat = require('concat-stream');

var privkey = fs.readFileSync(__dirname + '/files/private');
var pubkey = fs.readFileSync(__dirname + '/files/public');

test('garbage', function (t) {
    t.plan(1);
    
    var dec = hybrid.decrypt(privkey, { encoding: 'hex' });
    dec.on('error', function (err) { t.ok(err) });
    dec.end(Buffer([ 1, 97, 1, 2, 3 ]));
});
