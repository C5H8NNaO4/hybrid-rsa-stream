var hybrid = require('../');
var test = require('tape');
var fs = require('fs');
var concat = require('concat-stream');

var privkey = fs.readFileSync(__dirname + '/files/private');
var pubkey = fs.readFileSync(__dirname + '/files/public');

test('hex encoding', function (t) {
    t.plan(2);
    
    var dec = hybrid.decrypt(privkey, { encoding: 'hex' });
    var enc = hybrid.encrypt(pubkey, { encoding: 'hex' });
    
    enc.pipe(dec).pipe(concat(function (body) {
        t.equal(body.toString('utf8'), 'beep boop');
    }));
    enc.pipe(concat(function (body) {
        t.ok(/^[A-Fa-f0-9]+$/.test(body));
    }));
    enc.end('beep boop');
});
