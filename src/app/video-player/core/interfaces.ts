import { VideoFile } from '../../entity/video-file';

export interface VideoInfo {
    bangumiName: string;
    episodeId: string;
    episodeNo: number;
    nextEpisodeId?: string;
    nextEpisodeName?: string;
    nextEpisodeNameCN?: string;
    startPosition?: number;
    video_file: VideoFile;
}
