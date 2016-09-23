/**
 * Created by githop on 1/31/16.
 */

'use strict';

const versionQuestions = [
    {
        type: 'list',
        name: 'type',
        message: '',
        choices: ['DEVELOPMENT', 'PRODUCTION'],
        default: 'DEVELOPMENT'
    },
    {
        type: 'list',
        name: 'version',
        message: 'What kind of change is this?',
        choices: ['MAJOR', 'MINOR', 'PATCH'],
        default: 'PATCH'
    }
];

const finalVersionQuestions = [
    {
        type: 'confirm',
        name: 'finalVersion',
        message: '',
        default: false
    }
];

const gitQuestions = [
    {
        type: 'confirm',
        name: 'add',
        message: 'stage changes?',
        default: false
    },
    {
        type: 'confirm',
        name: 'commitAndTag',
        message: 'commit, tag, and release build: ',
        default: false
    }
];

const questions = { versionQuestions, finalVersionQuestions, gitQuestions };

module.exports = questions;