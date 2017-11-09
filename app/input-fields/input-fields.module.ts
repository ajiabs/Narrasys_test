import autofocus from './components/autofocus';
import ittAnnotationField from './components/ittAnnotationField';
import ittColorSelect from './components/ittColorSelect';
import ittDescriptionField from './components/ittDescriptionField';
import ittDisplaySelect from './components/ittDisplaySelect';
import ittDynamicModel from './components/ittDynamicModel';
import ittFileField from './components/ittFileField';
import { Flags } from './components/ittFlags';
import ittHighlightSelect from './components/ittHighlightSelect';
import ittImageField from './components/ittImageField';
import ittLanguageFlags from './components/ittLanguageFlags';
import ittLanguageSelect from './components/ittLanguageSelect';
import ittOptionsDisabled from './components/ittOptionsDisabled';
import ittShowFocus from './components/ittShowFocus';
import ittSpeakerField from './components/ittSpeakerField';
import ittSpeakerThumbField from './components/ittSpeakerThumbField';
import { TemplateSelect } from './components/ittTemplateSelect';
import ittTimeField from './components/ittTimeField';
import ittTimestampSelect from './components/ittTimestampSelect';
import ittTitleField from './components/ittTitleField';
import ittTranscriptField from './components/ittTranscriptField';
import ittTransitionSelect from './components/ittTransitionSelect';
import ittTypographySelect from './components/ittTypographySelect';
import { UploadTranscripts } from './components/ittUploadTranscriptsField';
import ittValidAsset from './components/ittValidAsset';
import ittValidEpisodeUrl from './components/ittValidEpisodeUrl';
import ittValidPathslug from './components/ittValidPathslug';
import ittValidUrl from './components/ittValidUrl';
import { VideoPositionSelect } from './components/ittVideoPositionSelect';
import { UrlField } from './components/npUrlField';

const inputFieldsModule = angular.module('inputFields', []);

// const components = [];
// const services = [];
//
// components.forEach((cmp: any) => {
//   inputFieldsModule.component(cmp.Name, new cmp());
// });
//
// services.forEach((svc: any) => {
//   inputFieldsModule.service(svc.Name, svc);
// });


const templates = (require as any).context('./components', true, /\.html$/);
templates.keys().forEach((path: any) => {
  console.log('path??', path);
  return templates(path);
});
inputFieldsModule
  .directive('autofocus', autofocus)
  .directive('ittAnnotationField', ittAnnotationField)
  .directive('ittColorSelect', ittColorSelect)
  .directive('ittDescriptionField', ittDescriptionField)
  .directive('ittDisplaySelect',ittDisplaySelect)
  .directive('ittDynamicModel', ittDynamicModel)
  .directive('ittFileField', ittFileField)
  .component(Flags.Name, new Flags())
  .directive('ittHighlightSelect', ittHighlightSelect)
  .directive('ittImageField', ittImageField)
  .directive('ittLanguageFlags', ittLanguageFlags)
  .directive('ittLanguageSelect', ittLanguageSelect)
  .directive('ittOptionsDisabled', ittOptionsDisabled)
  .directive('ittShowFocus', ittShowFocus)
  .directive('ittSpeakerField', ittSpeakerField)
  .directive('ittSpeakerThumbField', ittSpeakerThumbField)
  .component(TemplateSelect.Name, new TemplateSelect())
  .directive('ittTimeField', ittTimeField)
  .directive('ittTimestampSelect', ittTimestampSelect)
  .directive('ittTitleField', ittTitleField)
  .directive('ittTranscriptField', ittTranscriptField)
  .directive('ittTransitionSelect', ittTransitionSelect)
  .directive('ittTypographySelect', ittTypographySelect)
  .component(UploadTranscripts.Name, new UploadTranscripts())
  .directive('ittValidAsset', ittValidAsset)
  .directive('ittValidEpisodeUrl', ittValidEpisodeUrl)
  .directive('ittValidPathslug', ittValidPathslug)
  .directive('ittValidUrl', ittValidUrl)
  .component(VideoPositionSelect.Name, new VideoPositionSelect())
  .component(UrlField.Name, new UrlField());

export default inputFieldsModule;
