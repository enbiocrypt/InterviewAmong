'use strict';

var
  exec = require('../lib/ssh-exec');

describe('Unit tests', function () {
  it('should do the job', function (done) {
    var
      config = {
        host: null,
        port: 22,
        username: null,
        password: null
      },
      command = 'ls -alh';

    exec(config, command, function (error, response) {

      if (error) { return done(error); }

      console.log(response);
      done();
    });
  });
});