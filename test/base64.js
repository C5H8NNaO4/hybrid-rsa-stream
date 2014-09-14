var hybrid = require('../');
var test = require('tape');
var fs = require('fs');
var concat = require('concat-stream');

var privkey = fs.readFileSync(__dirname + '/files/private');
var pubkey = fs.readFileSync(__dirname + '/files/public');

test('base64 encoding', function (t) {
    t.plan(2);
    
    var dec = hybrid.decrypt(privkey, { encoding: 'base64' });
    var enc = hybrid.encrypt(pubkey, { encoding: 'base64' });
    
    enc.pipe(dec).pipe(concat(function (body) {
        t.equal(body.toString('utf8'), 'beep boop');
    }));
    enc.pipe(concat(function (body) {
        t.ok(/^[A-Za-z0-9\/+]+=*$/.test(body));
    }));
    enc.end('beep boop');
});
