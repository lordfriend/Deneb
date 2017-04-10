export class Tag {
    _id: string;
    activity: number;
    locale: { ja: string, zh_cn: string, zh_tw: string, en: string };
    name: string;
    syn_lowercase: string[];
    synonyms: string[];
    type: string
}

export class Torrent {
    btskey: string;
    category_tag_id: string;
    comments: number;
    content: string[][];
    downloads: number;
    file_id: string;
    finished: 807;
    infoHash: string;
    introduction: string;
    leechers: 15;
    magnet: string;
    publish_time: string;
    seeders: number;
    size: string;
    tag_ids: string[];
    team_id: string;
    team_sync: any;
    title: string;
    uploader_id: string;
    _id: string;
    // add by Albireo
    eps_no_list: number[]
}
