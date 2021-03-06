
import { Versioner } from './versioner';
import { initialGreeting, warn } from './utils';
import {
  addTag,
  askBuildType,
  commitChanges,
  confirmVersionFile,
  handleBuildAnswer,
  handleSourcemaps,
  pushChanges,
  pushTag,
  readVersionFile,
  showGitStatus,
  showVersionDiff,
  stageChanges,
  tryWebpackTest,
  tryWebpackBuild,
  checkUpgradeProgress
} from './app';

buildApp()
  .catch((e: string) => warn(e));

async function buildApp(): Promise<void> {
  const currentVersion = await readVersionFile();
  const versioner = new Versioner(currentVersion);

  initialGreeting(currentVersion);
  const buildTypeAnswer = await askBuildType();
  const releaseTypeAnswer = await handleBuildAnswer(buildTypeAnswer, versioner);
  await tryWebpackTest(buildTypeAnswer.type);
  await tryWebpackBuild();
  await handleSourcemaps();
  await confirmVersionFile(releaseTypeAnswer.finalVersion);
  await checkUpgradeProgress();
  const currentSha = await showGitStatus();
  await stageChanges(currentVersion);
  await commitChanges(releaseTypeAnswer.finalVersion, currentVersion);
  await pushChanges(currentSha);
  await addTag(releaseTypeAnswer.finalVersion, currentSha);
  await pushTag(releaseTypeAnswer.finalVersion, currentSha);
  await showVersionDiff(releaseTypeAnswer.buildType, releaseTypeAnswer.finalVersion);
}


