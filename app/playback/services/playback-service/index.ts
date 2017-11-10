/**
 * Created by githop on 4/14/17.
 */



interface IPlayerStates {
  '-1': 'unstarted';
  '0': 'ended';
  '1': 'playing';
  '2': 'paused';
  '3': 'buffering';
  '4': 'quality changed';
  '5': 'video cued';
  '6': 'player ready';
}

export const PLAYERSTATES: IPlayerStates = {
  '-1': 'unstarted',
  '0': 'ended',
  '1': 'playing',
  '2': 'paused',
  '3': 'buffering',
  '5': 'video cued',
  '4': 'quality changed',
  '6': 'player ready'
};

export const PLAYERSTATES_WORD = {
  'unstarted': '-1',
  'ended': '0',
  'playing': '1',
  'paused': '2',
  'buffering': '3',
  'quality changed': '4',
  'video cued': '5',
  'player ready': '6'
};
