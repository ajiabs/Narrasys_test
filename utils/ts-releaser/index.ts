import {
  prompt,
  runCmd,
  pReadFile,
  clientDir,
  inform,
  warn,
  initialGreeting,
  pSpawn,
  pWriteFile,
  success,
  httpRequest,
  link
} from './utils';
import { Versioner } from './versioner';
import * as questions from './questions';

buildApp()
  .catch((e: string) => warn(e));

async function buildApp(): Promise<void> {
  const currentVersion = await readVersionFile();
  const versioner = new Versioner(currentVersion);

  initialGreeting(currentVersion);
  const buildTypeAnswer = await askBuildType();
  const releaseTypeAnswer = await handleBuildAnswer(buildTypeAnswer, versioner);
  await tryWebpackBuild();
  await handleSourcemaps();
  await confirmVersionFile(releaseTypeAnswer.finalVersion);
  await showGitStatus();
  await stageChanges(currentVersion);
  await commitChanges(releaseTypeAnswer.finalVersion, currentVersion);
  await pushChanges();
  await addTag(releaseTypeAnswer.finalVersion);
  await pushTag(releaseTypeAnswer.finalVersion);
  await showVersionDiff(releaseTypeAnswer.buildType, currentVersion, releaseTypeAnswer.finalVersion);
}

function readVersionFile() {
  return pReadFile(clientDir + '/app/version.txt');
}
/* asks the user what type of build this is, production or development */
function askBuildType(): Promise<any> {
  return prompt(questions.versionQuestions[0]);
}

/*
  asks the user what level of release: e.g. major, minor, patch
  then increments the relevant version number.
*/
function handleBuildAnswer(
  answers: { type: string },
  versioner: Versioner): Promise<{buildType: string, finalVersion: string}> {
  const { type } = answers;
  if (type === 'DEVELOPMENT') {
    return prompt(questions.versionQuestions[1])
      .then((answer: { version: string }) => {
        return answer.version;
      })
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

/* attempt a webpack build */
function tryWebpackBuild(): Promise<void> {
  inform('attempting webpack build');
  return pSpawn('yarn', ['prod']);
}

/*
  asks user to confirm final version, if so, new final version is written to version.txt
  otherwise the build is aborted.
*/
function confirmVersionFile(finalVersion: string): Promise<void> {
  questions.finalVersionQuestions[0].message = `update version.txt to: ${finalVersion}?`;
  return prompt(questions.finalVersionQuestions)
    .then((answer: { finalVersion: boolean }) => answer.finalVersion)
    .then((confirmed: boolean) => {
      if (confirmed) {
        return pWriteFile(clientDir + '/app/version.txt', finalVersion)
          .then(() => success(`version.txt updated to ${finalVersion}`));
      } else {
        return Promise.reject('Build Aborted!');
      }
    });
}
/* move misc files into dist dir, move sourcemaps into sourcemaps dir
   see sourcemaps.sh for more
*/
function handleSourcemaps(): Promise<void> {
  return pSpawn('sh', ['sourcemaps.sh']);
}
/* confirms that production builds are on the master branch. */
function confirmMasterBranch(buildType: string): Promise<void> {
  return runCmd('git symbolic-ref --short HEAD')
    .then((branch: string) => {
      if (branch !== 'master' && buildType === 'PRODUCTION') {
        return prompt(questions.gitQuestions[2])
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

function showGitStatus(): Promise<void> {
  return runCmd('git status')
    .then((gitStatus: string) => console.log(gitStatus));
}

function stageChanges(currentVersion: string): Promise<void> {
  return prompt(questions.gitQuestions[0])
    .then((answer: { add: boolean }) => answer.add)
    .then((confirm: boolean) => {
      if (!confirm) {
        return pWriteFile(clientDir + '/app/version.txt', currentVersion)
          .then(() => Promise.reject('Build Aborted!'));
      } else {
        return runCmd('git add -A .')
          .then(() => success('changes staged.'));
      }
    });
}

function commitChanges(finalVersion: string, currentVersion: string): Promise<void> {
  const commitMessage = `build ${finalVersion} :shipit:`;
  questions.gitQuestions[1].message += finalVersion + '?';
  return prompt(questions.gitQuestions[1])
    .then((answer: { commitAndTag: boolean }) => answer.commitAndTag)
    .then((confirm: boolean) => {
      if (!confirm) {
        return pWriteFile(clientDir + '/app/version.txt', currentVersion)
          .then(() => Promise.reject('Build Aborted!'));
      } else {
        return runCmd(`git commit -m "${commitMessage}"`)
          .then(() => success('Changes committed.'));
      }
    });
}

function pushChanges(): Promise<void> {
  return runCmd('git symbolic-ref --short HEAD')
    .then((branch: string) => {
      inform('pushing commit, current branch:', branch);
      return branch;
    })
    .then((branch: string) => runCmd(`git push origin ${branch.trim()}`))
    .then(() => success('push complete.'));
}

function addTag(finalVersion: string): Promise<void> {
  inform(`adding tag: ${finalVersion}`);
  return runCmd(`git tag ${finalVersion}`)
    .then(() => success(`tag ${finalVersion} added.`));
}

function pushTag(finalVersion: string): Promise<void> {
  return runCmd('git push --tags')
    .then(() => {
      success('tag pushed.');
      success(`build ${finalVersion} ready for release!`);
    });
}

function showVersionDiff(releaseType: string, currentVersion: string, finalVersion: string): Promise<void> {
  const ghCompareStr = `https://github.com/inthetelling/client/compare`;
  inform('github diff URL:');
  if (releaseType === 'PRODUCTION') {
    return getLastProductionRelease()
      .then((currentProdVersion: string) => {
        link(`${ghCompareStr}/${currentProdVersion}...${finalVersion}`);
      });
  } else {
    return Promise.resolve()
      .then(() => link(`${ghCompareStr}/${currentVersion}...${finalVersion}`));
  }
}

function getLastProductionRelease(): Promise<string> {
  return httpRequest('https://np.narrasys.com/version.txt')
    .then((currentVersion: string) => currentVersion);
}


