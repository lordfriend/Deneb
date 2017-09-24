export class Announce {
    id?: string;
    url: string;
    image_url: string;
    position: number;
    sort_order: number;
    start_time: number;
    end_time: number;

    static POSITION_BANNER = 1;
}
