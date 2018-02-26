import { Bangumi } from './bangumi';

export class Announce {
    id?: string;
    content: string;
    bangumi?: Bangumi;
    image_url?: string;
    position: number;
    sort_order: number;
    start_time: number;
    end_time: number;

    static POSITION_BANNER = 1;
    static POSITION_BANGUMI = 2;
}
