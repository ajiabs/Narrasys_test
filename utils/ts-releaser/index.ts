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
  success
} from './utils';
import { Versioner } from './versioner';
import * as questions from './questions';

buildApp()
  .catch((e: string) => warn(e));

async function buildApp() {
  const currentVersion = await readVersionFile();
  const versioner = new Versioner(currentVersion);

  initialGreeting(currentVersion);
  const buildTypeAnswer = await askBuildType();

  const releaseTypeAnswer = await handleBuildAnswer(buildTypeAnswer, versioner);
  await tryWebpackBuild();
  await handleSourcemaps();
  await confirmVersionFile(releaseTypeAnswer.finalVersion);
  const gStatus = await gitStatus();
  console.log('git status!', gStatus);
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
function handleBuildAnswer(answers: any, versioner: Versioner): Promise<{buildType: string, finalVersion: string}> {
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
    return versioner.productionRelease(type)
      .then((finalVersion: string) => ({ finalVersion, buildType: type }));
  }
}

/* attempt a webpack build */
function tryWebpackBuild() {
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
function handleSourcemaps() {
  return pSpawn('sh', ['sourcemaps.sh']);
}

function gitStatus() {
  return runCmd('git status');
}

