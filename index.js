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
    var encoding = defined(opts.encoding, 'binary');
    var output = encoding === 'binary'
        ? through()
        : through(function (buf, e, next) {
            this.push(buf.toString(encoding));
            next();
        })
    ;
    
    var enc = rsa.encrypt(pubkey);
    enc.write(Buffer.concat([ Buffer([ balgo.length ]), balgo ]));
    
    var klen = Buffer(2);
    klen.writeUInt16BE(key.length, 0);
    output.write(klen);
    
    enc.pipe(concat(function (body) {
        var blen = Buffer([ body.length ]);
        output.write(Buffer.concat([ blen, body ]));
        
        var cipher = crypto.createCipher(algo, key);
        input.pipe(cipher).pipe(output);
    }));
    
    enc.end(key);
    return duplexer(input, output);
};

exports.decrypt = function (privkey, opts) {
    if (!opts) opts = {};
    var dec = rsa.decrypt(privkey, opts);
};
