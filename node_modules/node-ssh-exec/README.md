# node-ssh-exec

A simple ssh2 wrapper to exec shell commands on remotes via ssh using Node.js.

## Installation

```
npm install node-ssh-exec
```

## Usage

```javascript
var
    exec = require('node-ssh-exec');

var
    // see https://github.com/mscdex/ssh2
    config = {
        host: 'localhost',
        username: 'root',
        password: 'root'
    },
    command = 'ls -alh';

exec(config, command, function (error, response) {
    if (error) {
        throw error;
    }

    console.log(response);
});
```