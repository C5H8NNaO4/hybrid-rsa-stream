var crypto = require('crypto');
var rsa = require('rsa-stream');
var through = require('through2');
var duplexer = require('duplexer2');
var defined = require('defined');
var concat = require('concat-stream');

exports.encrypt = function (pubkey, opts) {
    if (!opts) opts = {};
    var key = crypto.randomBytes(32);
    
    var algo = defined(opts.algorithm, 'AES-256-CBC');
    var balgo = Buffer(algo);
    
    var input = through();
    var output = makeOutput(opts.encoding);
    var enc = rsa.encrypt(pubkey);
    
    enc.pipe(concat(function (body) {
        var blen = Buffer(2);
        blen.writeUInt16BE(body.length, 0);
        
        var blen = Buffer([ body.length ]);
        output.write(Buffer.concat([ blen, body ]));
        
        var cipher = crypto.createCipher(algo, key);
        input.pipe(cipher).pipe(output);
    }));
    
    var blen = Buffer([ balgo.length ]);
    enc.end(Buffer.concat([ blen, balgo, key ]));
    return duplexer(input, output);
};

exports.decrypt = function (privkey, opts) {
    if (!opts) opts = {};
    var dec = rsa.decrypt(privkey, opts);
    
    var input = through();
    var output = through();
    return duplexer(input, output);
};

function makeOutput (enc) {
    var encoding = defined(enc, 'binary');
    if (encoding === 'binary') return through();
    return through(function (buf, e, next) {
        this.push(buf.toString(encoding));
        next();
    });
}
