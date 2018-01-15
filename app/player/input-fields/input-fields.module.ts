import autofocus, { Autofocus } from './directives/autofocus';
import ittAnnotationField, { AnnotationField } from './components/ittAnnotationField';
import ittColorSelect, { ColorSelect } from './components/ittColorSelect';
import ittDescriptionField, { DescriptionField } from './components/ittDescriptionField';
import ittDisplaySelect from './components/ittDisplaySelect';
import { DynamicModel } from './directives/ittDynamicModel';
import { FileField } from './components/ittFileField';
import { Flags } from './components/ittFlags';
import ittHighlightSelect, { HighlightSelect } from './components/ittHighlightSelect';
import ittImageField, { ImageField } from './components/ittImageField';
import  { LanguageFlags } from './components/ittLanguageFlags';
import ittLanguageSelect, { LanguageSelect }  from './components/ittLanguageSelect';
import ittSpeakerField, { SpeakerField } from './components/ittSpeakerField';
import ittSpeakerThumbField from './components/ittSpeakerThumbField';
import { TemplateSelect } from './components/ittTemplateSelect';
import ittTimeField, { TimeField } from './components/ittTimeField';
import ittTimestampSelect, { TimestampSelect } from './components/ittTimestampSelect';
import ittTitleField, { TitleField } from './components/ittTitleField';
import ittTranscriptField, { TranscriptField } from './components/ittTranscriptField';
import ittTransitionSelect, { TransitionSelect } from './components/ittTransitionSelect';
import ittTypographySelect, { TypographySelect } from './components/ittTypographySelect';
import { UploadTranscripts } from './components/ittUploadTranscriptsField';
import { ValidAsset } from './directives/ittValidAsset';
import { ValidEpisodeUrl } from './directives/ittValidEpisodeUrl';
import { ValidPathSlug } from './directives/ittValidPathslug';
import ittValidUrl, { ValidUrl } from './directives/ittValidUrl';
import { VideoPositionSelect } from './components/ittVideoPositionSelect';
import { UrlField } from './components/npUrlField';
import sxsAddContent from './components/add-content/sxsAddContent';
import { AnnotatorAutocomplete } from './components/annotator-autocomplete/sxsAnnotatorAutocomplete';
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
import { IEpisode, IEvent } from '../../models';

const npInputFieldsModule = angular.module('np.inputFields', []);

const templates = [
  Autofocus,
  SxsAnnotationFieldTemplate,
  SxsFileFieldTemplate,
  SxsImageFieldTemplate,
  SxsLinkFieldTemplate,
  SxsQuestionFieldTemplate,
  SxsVideoFieldTemplate,
  UploadMasterassetTemplate,
  UploadPosterTemplate,
  UploadProducerTemplate,
  UploadSxsTemplate,
  ValidAsset,
  ValidUrl,
  ValidPathSlug,
  ValidEpisodeUrl,
  DynamicModel
];

templates.forEach((t: any) => {
  npInputFieldsModule.directive(t.Name, t.factory());
});

export interface IProducerInputFieldController extends ng.IComponentController {
  data: IEvent | IEpisode;
  onUpdate?: () => void;
}

npInputFieldsModule
  .directive('autofocus', autofocus)
  .directive('ittAnnotationField', ittAnnotationField)
  .component(AnnotationField.Name, new AnnotationField)
  .directive('ittColorSelect', ittColorSelect)
  .component(ColorSelect.Name, new ColorSelect())
  .directive('ittDescriptionField', ittDescriptionField)
  .component(DescriptionField.Name, new DescriptionField())
  .directive('ittDisplaySelect',ittDisplaySelect)
  .component(FileField.Name, new FileField())
  .component(Flags.Name, new Flags())
  .directive('ittHighlightSelect', ittHighlightSelect)
  .component(HighlightSelect.Name, new HighlightSelect())
  .directive('ittImageField', ittImageField)
  .component(ImageField.Name, new ImageField())
  // .directive('ittLanguageFlags', ittLanguageFlags)
  .directive('ittLanguageSelect', ittLanguageSelect)
  .component(LanguageSelect.Name, new LanguageSelect())
  .directive('ittSpeakerField', ittSpeakerField)
  .component(SpeakerField.Name, new SpeakerField())
  .directive('ittSpeakerThumbField', ittSpeakerThumbField)
  .component(TemplateSelect.Name, new TemplateSelect())
  .directive('ittTimeField', ittTimeField)
  .component(TimeField.Name, new TimeField())
  .directive('ittTimestampSelect', ittTimestampSelect)
  .component(TimestampSelect.Name, new TimestampSelect())
  .directive('ittTitleField', ittTitleField)
  .component(TitleField.Name, new TitleField())
  .directive('ittTranscriptField', ittTranscriptField)
  .component(TranscriptField.Name, new TranscriptField())
  .directive('ittTransitionSelect', ittTransitionSelect)
  .component(TransitionSelect.Name, new TransitionSelect())
  .directive('ittTypographySelect', ittTypographySelect)
  .component(TypographySelect.Name, new TypographySelect())
  .component(UploadTranscripts.Name, new UploadTranscripts())
  .directive('ittValidUrl', ittValidUrl)
  .directive('sxsInputI18n', sxsInputI18n)
  .directive('sxsInputTime', sxsInputTime)
  .directive('sxsAddContent', sxsAddContent)
  .component(AnnotatorAutocomplete.Name, new AnnotatorAutocomplete())
  .component(VideoPositionSelect.Name, new VideoPositionSelect())
  .component(UrlField.Name, new UrlField())
  .component(LanguageFlags.Name, new LanguageFlags());

export default npInputFieldsModule;
