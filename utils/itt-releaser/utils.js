/**
 * Created by githop on 1/31/16.
 */

'use strict';

const chalk = require('chalk');
const fs = require('fs');
const spawn = require('child_process').spawn;
const path = require('path');
const Promise = require('bluebird');

const utils = args => {

    const clientDir = args || path.resolve('../../');

    function inform() {
        let args = Array.prototype.slice.call(arguments);
        _decorateArgs('Note:', args);
        console.log(chalk.blue.apply(this, args));
    }

    function stream(data) {
        console.log(data.toString());
    }

    function success() {
        let args = Array.prototype.slice.call(arguments);
        _decorateArgs('Success:', args);
        console.log(chalk.green.apply(this, args));
    }

    function warn() {
        let args = Array.prototype.slice.call(arguments);
        _decorateArgs('Error:', args);
        console.log(chalk.red.apply(this, args));
    }

    function log() {
        let args = Array.prototype.slice.call(arguments);
        _decorateArgs('Log:', args);
        console.log.apply(this, args);
    }

    function _decorateArgs(type, args) {
        return args.unshift(new Date().toLocaleTimeString(), type);
    }

    function readVersionOnInit(cb) {
        const path = clientDir + '/app/version.txt';
        fs.readFile(path, 'utf8', cb);
    }

    function writeFinalVersion(version, cb, revert) {
        if (revert === true) {
            inform('reverting version.txt back to:', version);
        } else {
            inform('attempting to write', version, 'to version.txt');
        }
        const file = clientDir + '/app/version.txt';
        fs.writeFile(file, version, cb);
    }

    function spawnChildProcess(cmd, args, env) {
      let config = { cwd: clientDir };
      if (env != null) {
        Object.assign(config, process.env, {PATH: process.env.PATH + ':/usr/local/bin'})
      }
        return spawn(cmd, args, config);
    }

    function promisifySpawnChildProcess(cmd, args) {

        var returnData;
        return new Promise((resolve, reject) => {
            const cp = spawn(cmd, args, {cwd: clientDir});

            cp.stdout.on('data', data => { returnData = data.toString();});
            cp.stderr.on('data', reject);

            cp.on('close', code => {
                if (code !== 0) {
                    reject(code);
                }
                resolve(returnData);
            });

        });
    }

    function blueCo(dfd) {
        return Promise.coroutine(function*(){
            let results = yield Promise.resolve(dfd);
            return results;
        });
    }

    function updateConfig(done) {
        inform('attempting to reset config.js');
        fs.readFile(__dirname + '/cleanConfig.js', 'utf8', (err, data) => {
            if (err) {
                throw err;
            }

            const file = clientDir + '/app/config.js';
            fs.writeFile(file, data, (err) => {
                if (err) {
                    throw err;
                }
                success('config.js reset.');
                done();
            })
        });

    }

    return {
        inform,
        success,
        warn,
        log,
        readVersionOnInit,
        writeFinalVersion,
        updateConfig,
        spawnChildProcess,
        stream,
        promisifySpawnChildProcess,
        blueCo
    };
};

module.exports = utils;
