import autofocus from './directives/autofocus';
import ittAnnotationField from './components/ittAnnotationField';
import ittColorSelect from './components/ittColorSelect';
import ittDescriptionField from './components/ittDescriptionField';
import ittDisplaySelect from './components/ittDisplaySelect';
import ittDynamicModel from './directives/ittDynamicModel';
import ittFileField from './components/ittFileField';
import { Flags } from './components/ittFlags';
import ittHighlightSelect from './components/ittHighlightSelect';
import ittImageField from './components/ittImageField';
import ittLanguageFlags from './components/ittLanguageFlags';
import ittLanguageSelect from './components/ittLanguageSelect';
import ittShowFocus from './directives/ittShowFocus';
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
import ittValidAsset from './directives/ittValidAsset';
import ittValidEpisodeUrl from './directives/ittValidEpisodeUrl';
import ittValidPathslug from './directives/ittValidPathslug';
import ittValidUrl from './directives/ittValidUrl';
import { VideoPositionSelect } from './components/ittVideoPositionSelect';
import { UrlField } from './components/npUrlField';
import sxsAddContent from './components/add-content/sxsAddContent';
import sxsAnnotatorAutocomplete from './components/annotator-autocomplete/sxsAnnotatorAutocomplete';
import { SxsAnnotationFieldTemplate } from './templates/sxs-annotation/sxs-annotation-field.template';
import { SxsFileFieldTemplate } from './templates/sxs-file/sxs-file-field.template';
import { SxsImageFieldTemplate } from './templates/sxs-image/sxs-image-field.template';
import { SxsLinkFieldTemplate } from './templates/sxs-link/sxs-link-field.template';
import { SxsQuestionFieldTemplate } from './templates/sxs-question/sxs-question-field.template';
import { SxsVideoFieldTemplate } from './templates/sxs-video/sxs-video-field.template';
import sxsInputI18n from './components/input-i18n/sxsInputI18n';
import sxsInputTime from './components/input-time/sxsInputTime';
import { UploadMasterassetTemplate } from './templates/upload-masterasset/upload-masterasset.template';
import { UploadPosterTemplate } from './templates/upload-poster/upload-poster.template';
import { UploadProducerTemplate } from './templates/upload-producer/upload-producer.template';
import { UploadSxsTemplate } from './templates/upload-sxs/upload-sxs.template';

const npInputFieldsModule = angular.module('np.inputFields', []);

const templates = [
  SxsAnnotationFieldTemplate,
  SxsFileFieldTemplate,
  SxsImageFieldTemplate,
  SxsLinkFieldTemplate,
  SxsQuestionFieldTemplate,
  SxsVideoFieldTemplate,
  UploadMasterassetTemplate,
  UploadPosterTemplate,
  UploadProducerTemplate,
  UploadSxsTemplate
];

templates.forEach((t: any) => {
  npInputFieldsModule.directive(t.Name, t.factory());
});

npInputFieldsModule
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
  .directive('sxsInputI18n', sxsInputI18n)
  .directive('sxsInputTime', sxsInputTime)
  .directive('sxsAddContent', sxsAddContent)
  .directive('sxsAnnotatorAutocomplete', sxsAnnotatorAutocomplete)
  .component(VideoPositionSelect.Name, new VideoPositionSelect())
  .component(UrlField.Name, new UrlField());

export default npInputFieldsModule;
