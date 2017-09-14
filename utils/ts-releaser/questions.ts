export const versionQuestions = [
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

export const finalVersionQuestions = [
  {
    type: 'confirm',
    name: 'finalVersion',
    message: '',
    default: false
  }
];

export const gitQuestions = [
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
