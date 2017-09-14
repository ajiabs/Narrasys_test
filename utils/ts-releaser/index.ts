import {
  prompt,
  runCmd,
  pReadFile,
  clientDir,
  inform,
  warn,
  initialGreeting, pSpawn
} from './utils';
import { Versioner } from './versioner';
import * as questions from './questions';

// pReadFile(clientDir + '/app/version.txt')
//   .then((file: any) => {
//     console.log('file??', file);
//   })
//   .catch(e => console.log('e', e));

buildApp()
  .catch((e: string) => warn(e));

async function buildApp() {
  const currentVersion = await readVersionFile();
  const versioner = new Versioner(currentVersion);

  initialGreeting(currentVersion);
  const buildTypeAnswer = await askBuildType();

  const releaseTypeAnswer = await handleBuildAnswer(buildTypeAnswer, versioner);
  console.log(releaseTypeAnswer);
  const webpackBuild = await tryWebpackBuild();
  console.log('build code?', webpackBuild);
}

function readVersionFile() {
  return pReadFile(clientDir + '/app/version.txt');
}

function askBuildType(): Promise<any> {
  return prompt(questions.versionQuestions[0]);
}


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

function tryWebpackBuild() {
  return pSpawn('npm', ['run', 'prod']);
}

