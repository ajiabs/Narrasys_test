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
    name: 'commitChanges',
    // message: 'commit, tag, and release build: ',
    message: 'commit changes?',
    default: false
  },
  {
    type: 'confirm',
    name: 'pushChanges',
    // message: 'commit, tag, and release build: ',
    message: 'push changes?',
    default: false
  },
  {
    type: 'confirm',
    name: 'addTag',
    message: 'add tag?'
  },
  {
    type: 'confirm',
    name: 'pushTag',
    message: 'push tag?'
  },
  {
    type: 'confirm',
    name: 'confirmOnMaster',
    message: 'You are not on the master branch, are you certain you want to continue?' +
    ' (typically prod releases are off master)'
  }
];
