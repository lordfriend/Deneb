import { Episode } from "./episode";
import { Image } from './image';
import { User } from './user';

export class Bangumi {
    id: string;
    bgm_id: number;
    name: string;
    name_cn: string;
    type: number;
    eps: number;
    summary: string;
    image: string;
    air_date: string;
    air_weekday: number;
    // @Deprecated
    rss: string;
    // @Deprecated
    eps_regex: string;
    dmhy: string;
    acg_rip: string;
    libyk_so: string;
    bangumi_moe: string;
    nyaa: string;
    status: number;
    create_time: number;
    update_time: number;
    // @Optional
    // @deprecated
    cover: string;
    // @Optional
    eps_no_offset: number;
    // @Optional
    episodes: Episode[];
    // @Optional
    favorite_status: number;
    // @Optional
    unwatched_count: number;
    // @Optional
    favorite_update_time: number;
    // @Optional
    favorite_check_time: number;
    // @Optional
    eps_update_time; number;
    // @Optional
    delete_mark: number;

    // @Optional
    delete_eta: number;

    // @deprecated
    cover_color: string;

    cover_image: Image | null;

    // @Optional
    created_by: User;

    // @Optional
    maintained_by: User;
    maintained_by_uid: string;

    // @Optional
    alert_timeout: number;

    static WISH = 1;
    static WATCHED = 2;
    static WATCHING = 3;
    static PAUSE = 4;
    static ABANDONED = 5;

    static containKeyword(bangumi: Bangumi, name: string): boolean {
        let nameLowerCase = name.toLowerCase();
        let keywords = nameLowerCase.split(' ');
        if (keywords.length === 1 && !keywords[0]) {
            return (bangumi.name && bangumi.name.toLowerCase().indexOf(nameLowerCase) !== -1)
                || (bangumi.name_cn && bangumi.name_cn.toLowerCase().indexOf(nameLowerCase) !== -1)
                || (bangumi.summary && bangumi.summary.toLowerCase().indexOf(nameLowerCase) !== -1);
        }
        return (bangumi.name && keywords.every(k => bangumi.name.toLowerCase().indexOf(k) !== -1))
            || (bangumi.name_cn && keywords.every(k => bangumi.name_cn.toLowerCase().indexOf(k) !== -1))
            || (bangumi.summary && keywords.every(k => bangumi.summary.toLowerCase().indexOf(k) !== -1));
    }

}
