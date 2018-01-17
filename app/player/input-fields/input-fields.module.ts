import { Autofocus } from './directives/autofocus';
import { AnnotationField } from './components/ittAnnotationField';
import { ColorSelect } from './components/ittColorSelect';
import { DescriptionField } from './components/ittDescriptionField';
import { DisplaySelect } from './components/ittDisplaySelect';
import { DynamicModel } from './directives/ittDynamicModel';
import { FileField } from './components/ittFileField';
import { Flags } from './components/ittFlags';
import { HighlightSelect } from './components/ittHighlightSelect';
import { ImageField } from './components/ittImageField';
import { LanguageFlags } from './components/ittLanguageFlags';
import { LanguageSelect }  from './components/ittLanguageSelect';
import { SpeakerField } from './components/ittSpeakerField';
import { SpeakerThumbField } from './components/ittSpeakerThumbField';
import { TemplateSelect } from './components/ittTemplateSelect';
import { TimeField } from './components/ittTimeField';
import { TimestampSelect } from './components/ittTimestampSelect';
import { TitleField } from './components/ittTitleField';
import { TranscriptField } from './components/ittTranscriptField';
import { TransitionSelect } from './components/ittTransitionSelect';
import { TypographySelect } from './components/ittTypographySelect';
import { UploadTranscripts } from './components/ittUploadTranscriptsField';
import { ValidAsset } from './directives/ittValidAsset';
import { ValidEpisodeUrl } from './directives/ittValidEpisodeUrl';
import { ValidPathSlug } from './directives/ittValidPathslug';
import { ValidUrl } from './directives/ittValidUrl';
import { VideoPositionSelect } from './components/ittVideoPositionSelect';
import { UrlField } from './components/npUrlField';
import { AddContent } from './components/add-content/sxsAddContent';
import { AnnotatorAutocomplete } from './components/annotator-autocomplete/sxsAnnotatorAutocomplete';
import { SxsAnnotationFieldTemplate } from './templates/sxs-annotation/sxs-annotation-field.template';
import { SxsFileFieldTemplate } from './templates/sxs-file/sxs-file-field.template';
import { SxsImageFieldTemplate } from './templates/sxs-image/sxs-image-field.template';
import { SxsLinkFieldTemplate } from './templates/sxs-link/sxs-link-field.template';
import { SxsQuestionFieldTemplate } from './templates/sxs-question/sxs-question-field.template';
import { SxsVideoFieldTemplate } from './templates/sxs-video/sxs-video-field.template';
import { InputI18n } from './components/input-i18n/sxsInputI18n';
import { InputTime } from './components/input-time/sxsInputTime';
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
  .component(AnnotationField.Name, new AnnotationField)
  .component(ColorSelect.Name, new ColorSelect())
  .component(DescriptionField.Name, new DescriptionField())
  .component(DisplaySelect.Name, new DisplaySelect())
  .component(FileField.Name, new FileField())
  .component(Flags.Name, new Flags())
  .component(HighlightSelect.Name, new HighlightSelect())
  .component(ImageField.Name, new ImageField())
  .component(LanguageSelect.Name, new LanguageSelect())
  .component(SpeakerField.Name, new SpeakerField())
  .component(SpeakerThumbField.Name, new SpeakerThumbField())
  .component(TemplateSelect.Name, new TemplateSelect())
  .component(TimeField.Name, new TimeField())
  .component(TimestampSelect.Name, new TimestampSelect())
  .component(TitleField.Name, new TitleField())
  .component(TranscriptField.Name, new TranscriptField())
  .component(TransitionSelect.Name, new TransitionSelect())
  .component(TypographySelect.Name, new TypographySelect())
  .component(UploadTranscripts.Name, new UploadTranscripts())
  .component(InputI18n.Name, new InputI18n())
  .component(InputTime.Name, new InputTime())
  .component(AddContent.Name, new AddContent())
  .component(AnnotatorAutocomplete.Name, new AnnotatorAutocomplete())
  .component(VideoPositionSelect.Name, new VideoPositionSelect())
  .component(UrlField.Name, new UrlField())
  .component(LanguageFlags.Name, new LanguageFlags());

export default npInputFieldsModule;
