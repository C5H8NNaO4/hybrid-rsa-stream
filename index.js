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
    
    var dup = duplexer(input, output);
    enc.on('error', function (err) { dup.emit('error', err) });
    
    enc.pipe(concat(function (body) {
        var blen = Buffer(2);
        blen.writeUInt16BE(body.length, 0);
        
        output.write(Buffer.concat([ blen, body ]));
        
        var cipher = crypto.createCipher(algo, key);
        input.pipe(cipher).pipe(output);
    }));
    
    var blen = Buffer([ balgo.length ]);
    enc.end(Buffer.concat([ blen, balgo, key ]));
    return dup;
};

exports.decrypt = function (privkey, opts) {
    if (!opts) opts = {};
    
    var input = makeInput(opts.encoding);
    var output = through();
    
    var prelude = null, preludeSize = null;
    var cipher = null;
    
    input.pipe(through(write, end));
    
    function write (buf, enc, next) {
        if (cipher) return cipher._write(buf, enc, next);
        
        if (!prelude) prelude = buf;
        else buf = Buffer.concat([ prelude, buf ]);
        
        if (prelude.length < 2) return next();
        if (!preludeSize) {
            preludeSize = prelude.readUInt16BE(0);
        }
        if (prelude.length - 2 >= preludeSize) {
            getDecipher(prelude.slice(2, preludeSize + 2), function (c) {
                cipher = c;
                c.write(prelude.slice(preludeSize + 2, prelude.length));
                c.pipe(output);
                prelude = null;
                next();
            });
        }
        else next();
    }
    function end () { cipher.end() }
    
    function getDecipher (payload, cb) {
        var dec = rsa.decrypt(privkey);
        dec.pipe(concat(function (body) {
            var alen = body[0];
            var algo = body.slice(1, alen + 1).toString('utf8');
            var key = body.slice(alen + 1, body.length);
            cb(crypto.createDecipher(algo, key));
        }));
        dec.end(payload);
    }
    
    return duplexer(input, output);
};

function makeInput (enc) {
    var encoding = defined(enc, 'binary');
    if (encoding === 'binary') return through();
    return through(function (buf, e, next) {
        this.push(Buffer(buf.toString('utf8'), encoding));
        next();
    });
}

function makeOutput (enc) {
    var encoding = defined(enc, 'binary');
    if (encoding === 'binary') return through();
    return through(function (buf, e, next) {
        this.push(buf.toString(encoding));
        next();
    });
}
