# hybrid-rsa-stream

asymmetrically encrypt a key for a symmetric cipher

[hybrid](http://www.cs.rochester.edu/~brown/Crypto/assts/projects/hybrid/hybrid.html)

# data

The data over the wire is:

```
[asymmetric ciphertext length (UInt16BE, 2 bytes)]
[asymmetric ciphertext]
[symmetric ciphertext]
```

The cleartext for the asymmetric payload is:

```
[symmetric key name length (UInt8, 1 byte)]
[symmetric key name string]
[symmetric key (remaining bytes)]
```

# example

## encrypt with a public key

To send someone a message only knowing their public key:

``` js
var hybrid = require('hybrid-rsa-stream');
var fs = require('fs');
var pubkey = fs.readFileSync(__dirname + '/files/public');

var enc = hybrid.encrypt(pubkey, { encoding: 'base64' });
process.stdin.pipe(enc).pipe(process.stdout);
```

## decrypt with a private key

Now the recepient of the message can decrypt the message with their private
key:

``` js
var hybrid = require('hybrid-rsa-stream');
var fs = require('fs');
var pubkey = fs.readFileSync(__dirname + '/files/public');

var enc = hybrid.encrypt(pubkey, { encoding: 'base64' });
process.stdin.pipe(enc).pipe(process.stdout);
```

# methods

``` js
var hybrid = require('hybrid-rsa-stream')
```

## var enc = hybrid.encrypt(publicKey, opts)

Return a through stream `enc` that takes cleartext as input and produces
ciphertext as output encrypted with a public key buffer or string `publicKey` in
PEM or ssh-style format.

Optionally specify:

* `opts.encoding` - encoding to use for output. Valid encodings: `'base64'`,
`'hex'`, `'binary'`. Default encoding: `'binary'`.

## var dec = hybrid.decrypt(privateKey, opts)

Return a through stream `dec` that takes ciphertext as input and produces
decrypted cleartext as output from the private key string or buffer `privateKey`
in PEM or ssh-style format.

Optionally specify:

* `opts.encoding` - encoding to use for input. Valid encodings: `'base64'`,
`'hex'`, `'binary'`. Default encoding: `'binary'`.

# install

With [npm](https://npmjs.org) do:

```
npm install hybrid-rsa-stream
```

# license

MIT
