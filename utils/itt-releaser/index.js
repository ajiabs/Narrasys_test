'use strict';


const inquirer = require('inquirer');
const versioner = require('./versioner');
const u = require('./utils');
const utils = u(process.argv[2]);
let currentVersion;
let versionerInstance;

function revertVersionNumber() {
  utils.writeFinalVersion(currentVersion, (err) => {
    if (err) throw err;
  }, true);
}


utils.readVersionOnInit((err, data) => {
  if (err) {
    throw err;
  }

  utils.success('Welcome to itt-releaser!', 'Let\'s get started!');
  currentVersion = data;
  begin(data);
});

//function checkLatestTagOnMaster(version) {
//    const masterTag = utils.spawnChildProcess('git', ['describe', 'origin/master', '--tags']);
//
//    let pass = false;
//    let latestTagOnMaster;
//
//    masterTag.stdout.on('data', data => latestTagOnMaster = data.toString());
//    masterTag.on('close', code => {
//        if (code !== 0) {
//            utils.warn('failed getting latest tag via git.')
//        } else {
//            if (version !== latestTagOnMaster) {
//                utils.warn('Version.txt and latest tag on master do not match!');
//                pass = true;
//            }
//        }
//    });
//}

function begin(version) {
  const suffix = '\nWhat type of release is this?';
  versionerInstance = versioner(version);
  let versionQuestions = require('./questions').versionQuestions;

  versionQuestions[0].message = 'Current Version: ' + version + suffix;

  //skip change type prompt if production release
  if (versionerInstance.getReleaseType() === 'DEVELOPMENT') {
    versionQuestions.pop();
  }
  inquirer.prompt(versionQuestions, versionHandler);

  function versionHandler(answers) {

    //handle response
    const releaseLevel = answers.type;
    const versionType = answers.version;
    let finalVersion;

    if (releaseLevel === 'DEVELOPMENT') {
      versionerInstance.devRelease(versionType);
      finalVersion = versionerInstance.getFinalVersion();
    } else {

      try {
        versionerInstance.productionRelease(versionType)
      } catch (e) {
        utils.warn(e.message);
        return;
      }

      finalVersion = versionerInstance.getFinalVersion();
    }

    confirmFinalVersion(finalVersion)
  }
}

function confirmFinalVersion(finalVersion) {
  let finalVersionQuestions = require('./questions').finalVersionQuestions;
  finalVersionQuestions[0].message = 'update version.txt to: ' + finalVersion + '?';

  inquirer.prompt(finalVersionQuestions, finalVersionHandler);

  function finalVersionHandler(answers) {

    if (answers.finalVersion === false) {
      utils.warn('BUILD', finalVersion, 'ABORTED!');
      revertVersionNumber();
    } else {
      utils.writeFinalVersion(finalVersion, (err) => {
        if (err) {
          throw err;
        }
        utils.success('version.txt updated to', finalVersion);
        utils.updateConfig(() => tryWebpackBuild(finalVersion));
      });
    }
  }
}

function tryWebpackBuild(finalVersion) {
  utils.inform('attempting to build ', finalVersion);
  const gruntBuild = utils.spawnChildProcess('npm', ['run', 'prod']);
  gruntBuild.stdout.on('data', data => utils.stream(data));
  gruntBuild.stderr.on('data', data => utils.stream(data));
  gruntBuild.on('close', code => {
    if (code !== 0) {
      utils.warn('build task failed');
      revertVersionNumber();
    } else {
      utils.success('build', finalVersion, 'completed.');
      gzipJs(finalVersion)
    }
  });
}

function gzipJs(finalVersion) {
  utils.inform('compressing js');
  const gzip = utils.spawnChildProcess('sh', ['gzip.sh']);
  gzip.stdout.on('data', data => utils.stream(data));
  gzip.on('close', code => {
    if (code !== 0) {
      utils.warn('gzip error');
    } else {
      utils.success('js gzipped!');
      gitMagic(finalVersion);
    }
  })
}

function gitMagic(finalVersion) {
  //git flow
  //git status - confirm that it looks good
  //git add - state changes
  //git commit - with version name
  //git push
  //git tag - add new tag with version name
  //git push tag

  const gitQuestions = require('./questions').gitQuestions;
  const gitStatus = utils.spawnChildProcess('git', ['status']);
  gitStatus.stdout.on('data', data => utils.stream(data));
  gitStatus.on('close', code => {
    if (code !== 0) {
      utils.warn('git status command failed');
    } else {
      stageChanges();
    }
  });

  function stageChanges() {
    let stageChangesQuestion = gitQuestions[0];
    inquirer.prompt(stageChangesQuestion, stageChangesHandler);

    function stageChangesHandler(answer) {
      if (answer.add === false) {
        utils.warn('BUILD', finalVersion, 'ABORTED!');
        revertVersionNumber();
      } else {
        const gitAdd = utils.spawnChildProcess('git', ['add', '-A', '.']);
        gitAdd.stdout.on('data', data => utils.stream(data));
        gitAdd.on('close', close => {
          if (close !== 0) {
            utils.warn('failed to stage changes')
          } else {
            utils.success('changes staged.');
            tryRelease();
          }
        });
      }
    }
  }

  function tryRelease() {
    const commitMessage = `build ${finalVersion} :shipit:`;
    let releaseBuildQuestion = gitQuestions[1];
    releaseBuildQuestion.message += finalVersion;

    inquirer.prompt(releaseBuildQuestion, releaseQuestionHandler);

    function releaseQuestionHandler(answer) {
      if (answer.commitAndTag === false) {
        utils.warn('BUILD', finalVersion, 'ABORTED!');
        revertVersionNumber();
      } else {
        utils.inform('attempting to commit', commitMessage);
        const gitCommit = utils.spawnChildProcess('git', ['commit', '-m', commitMessage]);
        gitCommit.stdout.on('data', data => utils.stream(data));
        gitCommit.on('close', code => {
          if (code !== 0) {
            utils.warn('commit failed');
            revertVersionNumber();
          } else {
            utils.success('changes commited.');
            pushCommit();
          }
        });
      }
    }
  }

  function pushCommit() {
    getBranchName();

    let currentBranch;

    function getBranchName() {
      const branchName = utils.spawnChildProcess('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
      branchName.stdout.on('data', data => {
        currentBranch = data.toString();
      });
      branchName.on('close', code => {
        if (code !== 0) {
          utils.warn('getting branch name failed.');
          revertVersionNumber();
        } else {
          utils.success('current branch:', currentBranch);
          pushChanges();
        }
      });
    }

    function pushChanges() {
      utils.inform('pushing commit to', currentBranch);

      const gitPush = utils.spawnChildProcess('git', ['push', 'origin', currentBranch.trim()]);
      gitPush.stdout.on('data', data => utils.stream(data));
      gitPush.on('close', code => {
        if (code !== 0) {
          utils.warn('git push failed', code);
          revertVersionNumber();
        } else {
          utils.success('push complete');
          addTag();
        }
      });
    }

  }

  function addTag() {
    utils.inform('adding tag:', finalVersion);
    const addTag = utils.spawnChildProcess('git', ['tag', finalVersion]);
    addTag.on('close', code => {
      if (code !== 0) {
        utils.warn('git tag failed');
        revertVersionNumber();
      } else {
        utils.success('tag', finalVersion, 'added.');
        pushTag();
      }
    });
  }

  function pushTag() {
    utils.inform('pushing tag');
    const pushTag = utils.spawnChildProcess('git', ['push', '--tags']);
    pushTag.stdout.on('data', data => utils.stream(data));
    pushTag.on('close', code => {
      if (code !== 0) {
        utils.warn('pushing tag failed');
        revertVersionNumber();
      } else {
        utils.success('tag pushed');
        utils.success('build', finalVersion, 'ready for release!');
        utils.success('DONT FORGET TO SYNC DEV BRANCH!');
        utils.success('View diff:', '\n', showVersionDiff(finalVersion));
      }
    });
  }
}

function showVersionDiff(newVersion) {
  const releaseType = versionerInstance.getReleaseType(true);
  const vType = versionerInstance.getVersionType();
  let verionDiffStr = `${currentVersion}...${newVersion}`;

  if (releaseType === 'PRODUCTION') {
    verionDiffStr = `${versionerInstance.lastProductionRelease(newVersion, vType)}...${newVersion}`
  }

  return `https://github.com/inthetelling/client/compare/${verionDiffStr}`;
}
