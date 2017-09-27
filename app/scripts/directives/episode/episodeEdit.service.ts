
import { createInstance, IEpisode, IEpisodeTemplate } from '../../models';
import { IDataSvc, IEpisodeTheme, IModelSvc } from '../../interfaces';
import modelSvc from '../../services/modelSvc';

export interface IEpisodeEditService {
  updateEpisodeTemplate(episode: IEpisode, templateId: string): IEpisode;
}

export class EpisodeEditService implements IEpisodeEditService{
  static Name = 'episodeEdit'; // tslint:disable-line
  static $inject = ['modelSvc', 'dataSvc', 'episodeTheme'];
  constructor(
    private modelSvc: IModelSvc,
    private dataSvc: IDataSvc,
    private episodeTheme: IEpisodeTheme) {
   //
  }

  updateEpisodeTemplate(episode: IEpisode, templateId: string): IEpisode {
    const template = this.dataSvc.getTemplate(templateId) as IEpisodeTemplate;
    const copy = createInstance<IEpisode>('Episode', episode);
    copy.template = template;
    copy.template_id = template.id;
    const derived = this.modelSvc.deriveEpisode(copy);
    this.modelSvc.cache('episode', derived); // because resolveEpisodeEvents pulls from cache by ID
    const resolved = this.modelSvc.resolveEpisodeEvents(derived._id); // needed for template or style changes
    this.episodeTheme.setTheme(template);
    return resolved;
  }

}
