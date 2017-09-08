import {Bangumi} from './bangumi';
import {WatchProgress} from './watch-progress';
import {VideoFile} from './video-file';
import { Image } from './image';

export class Episode {

    static EPISODE_TYPE_NORMAL: number = 0;
    static EPISODE_TYPE_SPECIAL: number = 1;

    id: string;
    bangumi_id: string;
    bgm_eps_id: number;
    episode_no: number;
    name: string;
    name_cn: string;
    duration: string;
    airdate: string;
    status: number;
    torrent_id: string;
    create_time: number;
    update_time: number;
    bangumi: Bangumi; // optional
    // @deprecated
    thumbnail: string; // optional
    video_files: VideoFile[]; // optional

    // @Optional
    delete_mark: number;
    // @Optional
    delete_eta: number;

    // optional
    watch_progress: WatchProgress;

    // deprecated
    thumbnail_color: string;

    thumbnail_image: Image | null;


    static fromRawData(rawData: any, episode_no?: number) {
        let episode = new Episode();
        episode.bgm_eps_id = rawData.id;
        episode.episode_no = episode_no;
        episode.name = rawData.name;
        episode.name_cn = rawData.name_cn;
        episode.duration = rawData.duration;
        episode.airdate = rawData.airdate;
        return episode;
    }

    static STATUS_NOT_DOWNLOADED = 0;
    static STATUS_DOWNLOADING = 1;
    static STATUS_DOWNLOADED = 2;
}
