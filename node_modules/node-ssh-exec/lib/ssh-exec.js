'use strict';

(function (Connection, _) {

  function exec(config, command, callback) {

    if ( ! _.isObject(config)) { throw new Error('config parameter is not an object'); }
    if ( ! _.isString(command)) { throw new Error('command parameter is not a string'); }

    if ( ! _.isFunction(callback)) {
      callback = function () {};
    }

    var
      ssh = new Connection(),
      end = _.once(function () { ssh.end(); }),

      lastError,
      response = '',
      ret = _.once(function () { callback(lastError, response); });

    ssh
      .on('ready', function () {
        ssh.exec(command, function (error, stream) {
          if (error) {
            lastError = error;
            return;
          }

          stream
            .on('data', function (data) {
              response += data.toString();
            })
            .on('exit', function () {
              end();
            })
            .on('end', function () {
              end();
            })
            .on('close', function () {
              end();
            });
        });
      })
      .on('error', function (error) {
        lastError = error;
        end();
        ret();
      })
      .on('end', function () {
        ret();
      })
      .on('close', function () {
        ret();
      })
      .connect(config);
  }

  module.exports = exec;
}(
  require('ssh2'),
  require('underscore')
  )
);
