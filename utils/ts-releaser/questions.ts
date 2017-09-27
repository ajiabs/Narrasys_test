import { Question } from 'inquirer';

export const versionQuestions: Question[] = [
  {
    type: 'list',
    name: 'type',
    message: 'What kind of release is this?',
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

export const finalVersionQuestions: Question[] = [
  {
    type: 'confirm',
    name: 'finalVersion',
    message: '',
    default: false
  }
];

export const gitQuestions: Question[] = [
  {
    type: 'confirm',
    name: 'add',
    message: 'stage changes?',
    default: true
  },
  {
    type: 'confirm',
    name: 'commitChanges',
    // message: 'commit, tag, and release build: ',
    message: 'commit changes?',
    default: true
  },
  {
    type: 'confirm',
    name: 'pushChanges',
    // message: 'commit, tag, and release build: ',
    message: 'push changes?',
    default: true
  },
  {
    type: 'confirm',
    name: 'addTag',
    message: 'add tag?',
    default: true
  },
  {
    type: 'confirm',
    name: 'pushTag',
    message: 'push tag?',
    default: true
  },
  {
    type: 'confirm',
    name: 'confirmOnMaster',
    message: 'You are not on the master branch, are you certain you want to continue?' +
    ' (typically prod releases are off master)',
    default: true
  }
];
