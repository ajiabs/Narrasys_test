/**
 * Created by githop on 5/12/16.
 */


export interface IPlayer {
	create: (divId: string, playerId: string, videoId: string, stateCb?, qualityChangeCB?, onReadyCB?) => void
	destroy: (pid: string) => void;
	play: (pid: string) => void
	pause: (pid: string) => void
	pauseEmbeds: (pid: string) => void
	stop: (pid: string) => void
	reset: (pid: string) => void
	pauseOtherEmbeds: (pid: string) => void
	setPlaybackQuality: (pid: string) => void
	setPlayerId: (id: string, mainplayer: boolean) => Promise<string>
	getVideoLoadedFraction: (pid: string) => number
	seekTo: (pid: string, t: number, allowSeekAhead?: boolean) => void
	getCurrentTime: (pid: string) => number
	isMuted: (pid: string) => boolean
	mute: (pid: string) => void
	unMute: (pid: string) => void
	setVolume: (pid: string, v: number) => void
}
