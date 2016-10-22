import {Episode} from "./episode";
export class Bangumi {
  id: string;
  bgm_id: number;
  name: string;
  name_cn: string;
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
  status: number;
  create_time: number;
  update_time: number;
  // @Optional
  cover: string;
  // @Optional
  eps_no_offset: number;
  // @Optional
  episodes: Episode[];
  // @Optional
  favorite_status: number;
  // @Optional
  unwatched_count: number;

  static WISH = 1;
  static WATCHED = 2;
  static WATCHING = 3;
  static PAUSE = 4;
  static ABANDONED = 5;
}
