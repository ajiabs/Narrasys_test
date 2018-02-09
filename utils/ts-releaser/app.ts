import {
  prompt,
  runCmd,
  pReadFile,
  clientDir,
  modulesProgressDir,
  inform,
  pSpawn,
  pWriteFile,
  success,
  httpRequest,
  link
} from './utils';
import { Versioner } from './versioner';
import * as questions from './questions';

export function readVersionFile() {
  return pReadFile(clientDir + '/app/version.txt');
}
/* asks the user what type of build this is, production or development */
export function askBuildType(): Promise<any> {
  return prompt(questions.versionQuestions[0]);
}

/*
  asks the user what level of release: e.g. major, minor, patch
  then increments the relevant version number.
*/
export function handleBuildAnswer(
  answers: { type: string },
  versioner: Versioner): Promise<{buildType: string, finalVersion: string}> {
  const { type } = answers;
  if (type === 'DEVELOPMENT') {
    return prompt(questions.versionQuestions[1])
      .then((answer: { version: string }) => answer.version)
      .then((version: string) => {
        versioner.devRelease(version);
        return { buildType: type, finalVersion: versioner.finalVersion };
      });
  } else {
    return confirmMasterBranch(type)
      .then(() => versioner.productionRelease())
      .then((finalVersion: string) => ({ finalVersion, buildType: type }));
  }
}

export function tryWebpackTest(releaseType: string): Promise<void> {
  if (releaseType !== 'DEVELOPMENT') {
    return pSpawn('npm', ['run','test'])
      .catch((e: any) => Promise.reject('Unit Test Suite Failed!'));
  }
  return prompt(questions.unitTests[0])
    .then((answer: { runTests: boolean }) => answer.runTests)
    .then((confirm: boolean) => {
      if (!confirm) {
        return void 0;
      } else {
        return pSpawn('npm', ['run','test']);
      }
    })
    .catch((e: any) => Promise.reject('Unit Test Suite Failed!'));
}

/* attempt a webpack build */
export function tryWebpackBuild(): Promise<void> {
  inform('attempting webpack build');
  return pSpawn('npm', ['run','prod']);
}

/*
  asks user to confirm final version, if so, new final version is written to version.txt
  otherwise the build is aborted.
*/
export function confirmVersionFile(finalVersion: string): Promise<void> {
  questions.finalVersionQuestions[0].message = `update version.txt to: ${finalVersion}?`;
  return prompt(questions.finalVersionQuestions)
    .then((answer: { finalVersion: boolean }) => answer.finalVersion)
    .then((confirmed: boolean) => {
      if (confirmed) {
        return pWriteFile(clientDir + '/app/version.txt', finalVersion)
          .then(() => pWriteFile(clientDir + '/dist/version.txt', finalVersion))
          .then(() => success(`version.txt updated to ${finalVersion}`));
      } else {
        return Promise.reject('Build Aborted!');
      }
    });
}
/* move misc files into dist dir, move sourcemaps into sourcemaps dir
   see sourcemaps.sh for more
*/
export function handleSourcemaps(): Promise<void> {
  return pSpawn('sh', ['sourcemaps.sh']);
}
/* confirms that production builds are on the master branch. */
function confirmMasterBranch(buildType: string): Promise<void> {
  return getCurrentBranchName()
    .then((branch: string) => {
      if (branch !== 'master' && buildType === 'PRODUCTION') {
        return prompt(questions.gitQuestions[5])
          .then((answer: { confirmOnMaster: boolean }) => answer.confirmOnMaster)
          .then((confirm: boolean) => {
            if (!confirm) {
              return Promise.reject('Build Aborted!');
            }
            return void 0;
          });
      }
    });
}

function getCurrentBranchName(): Promise<string> {
  return runCmd('git symbolic-ref --short HEAD')
    .then((branch: string) => branch.trim());
}

export function showGitStatus(): Promise<string> {
  return runCmd('git status')
    .then((gitStatus: string) => console.log(gitStatus))
    .then(() => getCurrentSha());
}

export function stageChanges(currentVersion: string): Promise<void> {
  return prompt(questions.gitQuestions[0])
    .then((answer: { add: boolean }) => answer.add)
    .then((confirm: boolean) => {
      if (!confirm) {
        return pWriteFile(clientDir + '/app/version.txt', currentVersion)
          .then(() => Promise.reject('Build Aborted!'));
      } else {
        return runCmd('git add -A', true)
          .then(() => success('changes staged.'));
      }
    });
}

export function commitChanges(finalVersion: string, currentVersion: string): Promise<void> {
  const commitMessage = `build ${finalVersion} :shipit:`;
  questions.gitQuestions[1].message += finalVersion + '?';
  return prompt(questions.gitQuestions[1])
    .then((answer: { commitChanges: boolean }) => answer.commitChanges)
    .then((confirm: boolean) => {
      if (!confirm) {
        return pWriteFile(clientDir + '/app/version.txt', currentVersion)
          .then(() => Promise.reject('Build Aborted!'));
      } else {
        return runCmd(`git commit -m "${commitMessage}"`, true)
          .then(() => success('Changes committed.'));
      }
    });
}

export function pushChanges(currentSha: string): Promise<void> {
  const pushChangesPrompt = questions.gitQuestions[2];
  return prompt(pushChangesPrompt)
    .then((answer: { pushChanges: boolean }) => answer.pushChanges)
    .then((confirm: boolean) => {
      if (!confirm) {
        return hardReset(currentSha)
          .then(() => Promise.reject('Build Aborted!'));
      }
    })
    .then(() => runCmd('git symbolic-ref --short HEAD'))
    .then((branch: string) => {
      inform('pushing commit, current branch:', branch);
      return branch;
    })
    .then((branch: string) => runCmd(`git push origin ${branch.trim()}`))
    .then(() => success('push complete.'));
}

export function addTag(finalVersion: string, currentSha: string): Promise<void> {
  const addTagPrompt = questions.gitQuestions[3];
  return prompt(addTagPrompt)
    .then((answer: { addTag: boolean }) => answer.addTag)
    .then((confirm: boolean) => {
      if (!confirm) {
        // hard reset then push changes up to github
        return hardReset(currentSha)
          .then(() => getCurrentBranchName())
          .then((branch: string) => runCmd(`git push origin ${branch}`))
          .then(() => Promise.reject('Build Aborted!'));
      }
    })
    .then(() => runCmd(`git tag ${finalVersion}`))
    .then(() => success(`tag ${finalVersion} added.`));
}

export function pushTag(finalVersion: string, currentSha: string): Promise<void> {
  const pushTagPrompt = questions.gitQuestions[4];
  return prompt(pushTagPrompt)
    .then((answer: { pushTag: boolean }) => answer.pushTag)
    .then((confirm: boolean) => {
      if (!confirm) {
        return revertTag(finalVersion)
          .then(() => hardReset(currentSha))
          .then(() => Promise.reject('Build Aborted!'));
      }
    })
    .then(() => runCmd(`git push origin tags ${finalVersion}`))
    .then(() => {
      success('tag pushed.');
      success(`build ${finalVersion} ready for release!`);
    });
}

function getCurrentSha(): Promise<string> {
  return runCmd('git rev-parse HEAD');
}

function hardReset(currentSha: string): Promise<void> {
  return runCmd(`git reset --hard ${currentSha}`);
}

function revertTag(tag: string, syncOrigin: boolean = false): Promise<void> {
  return runCmd(`git tag -d ${tag}`)
    .then(() => {
      if (syncOrigin) {
        return runCmd(`git push origin :refs/tags/${tag}`);
      }
    });
}

export function showVersionDiff(releaseType: string, finalVersion: string): Promise<void> {
  const ghCompareStr = `https://github.com/inthetelling/client/compare`;
  inform('github diff URL:');
  if (releaseType === 'PRODUCTION') {
    return getLastProductionRelease()
      .then((currentProdVersion: string) => {
        link(`${ghCompareStr}/${currentProdVersion}...${finalVersion}`);
      })
      .then(() => logBranch());
  } else {
    return getLastDevRelease()
      .then((devCurrentVersion: string) => {
        link(`${ghCompareStr}/${devCurrentVersion}...${finalVersion}`);
      })
      .then(() => logBranch());
  }
}

function logBranch() {
  return getCurrentBranchName()
    .then((branch: string) => inform('Current branch:', branch));
}

function getLastProductionRelease(): Promise<string> {
  return httpRequest('https://np.narrasys.com/version.txt')
    .then((currentVersion: string) => currentVersion);
}

function getLastDevRelease(): Promise<string> {
  return httpRequest('https://np-dev.narrasys.com/version.txt')
    .then((devCurrentVersion: string) => devCurrentVersion);
}

export function checkUpgradeProgress() {
  return pSpawn('sh', ['progress.sh'], modulesProgressDir);
}
