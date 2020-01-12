import { ItemType } from './item-type';
import { Publisher } from './publisher';
import { Team } from './team';

export class Item {
    id: any;
    title: string;
    eps_no_list: number[];
    type: ItemType;
    team?: Team;
    timestampe: Date;
    uri?: string;
    publisher: Publisher;
    torrent_url?: string;
    magnet_uri?: string;
}
