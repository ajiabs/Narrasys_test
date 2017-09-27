
import { createInstance, IEpisode, IEpisodeTemplate } from '../../models';
import { IDataSvc, IEpisodeTheme, IModelSvc } from '../../interfaces';
import modelSvc from '../../services/modelSvc';

export interface IEpisodeEditService {
  sheetLoading: boolean;
  updateEpisodeTemplate(episode: IEpisode, templateId: string): ng.IPromise<IEpisode>;
}

export class EpisodeEditService implements IEpisodeEditService{
  private _sheetLoading = false;
  static Name = 'episodeEdit'; // tslint:disable-line
  static $inject = ['modelSvc', 'dataSvc', 'episodeTheme'];
  constructor(
    private modelSvc: IModelSvc,
    private dataSvc: IDataSvc,
    private episodeTheme: IEpisodeTheme) {
   //
  }

  get sheetLoading() {
    return this._sheetLoading;
  }

  set sheetLoading(val: boolean) {
    this._sheetLoading = val;
  }

  updateEpisodeTemplate(episode: IEpisode, templateId: string): ng.IPromise<IEpisode> {
    this.sheetLoading = true;
    const template = this.dataSvc.getTemplate(templateId) as IEpisodeTemplate;
    const copy = createInstance<IEpisode>('Episode', episode);
    copy.template = template;
    copy.template_id = template.id;
    const derived = this.modelSvc.deriveEpisode(copy);
    this.modelSvc.cache('episode', derived); // because resolveEpisodeEvents pulls from cache by ID
    const resolved = this.modelSvc.resolveEpisodeEvents(derived._id); // needed for template or style changes
    return this.episodeTheme.setTheme(template)
      .then(() => this.sheetLoading = false)
      .then(() => resolved);
  }

}
