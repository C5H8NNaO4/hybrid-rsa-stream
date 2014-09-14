var hybrid = require('../');
var test = require('tape');
var fs = require('fs');
var concat = require('concat-stream');

var privkey = fs.readFileSync(__dirname + '/files/private');
var pubkey = fs.readFileSync(__dirname + '/files/public');

test('end to end', function (t) {
    t.plan(1);
    
    var dec = hybrid.decrypt(privkey);
    var enc = hybrid.encrypt(pubkey);
    
    enc.pipe(dec).pipe(concat(function (body) {
        t.equal(body.toString('utf8'), 'beep boop');
    }));
    enc.end('beep boop');
});
