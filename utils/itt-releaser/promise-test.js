/**
 * Created by githop on 2/3/16.
 */
'use strict';

const u = require('./utils');
const utils = u(process.argv[2]);


let gitStatusPromise = utils.promisifySpawnChildProcess('git' ['status']);

utils.blueCo(gitStatusPromise);
