export class VideoFile {
    id: string;
    bangumi_id: string;
    episode_id: string;
    file_name: string;
    file_path: string;
    torrent_id: string;
    download_url: string;
    status: number;

    resolution_w: number;
    resolution_h: number;
    duration: number;
    label: string;
    // optional, only available at end-user api
    url: string;


    static STATUS_DOWNLOAD_PENDING = 1;
    static STATUS_DOWNLOADING = 2;
    static STATUS_DOWNLOADED = 3;
}
