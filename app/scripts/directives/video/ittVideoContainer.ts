
import {IEpisode} from '../../models';

const TEMPLATE_URL = 'templates/episode/components/video.html';

interface IVideoContainerBindings {
  episode: IEpisode;
  hideVideo: boolean;
}

class VideoContainerController implements ng.IComponentController, IVideoContainerBindings {
  episode: IEpisode;
  hideVideo: boolean;
}

export class VideoContainer implements ng.IComponentOptions {
  bindings: any = {
    episode: '<',
    hideVideo: '<'
  };
  templateUrl: string = TEMPLATE_URL;
  controller: ng.IComponentController = VideoContainerController;
  static Name: string = 'ittVideoContainer'; // tslint:disable-line
}
