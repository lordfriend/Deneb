import {Episode} from "./episode";
export class Bangumi {
  public id: string;
  public bgm_id: number;
  public name: string;
  public name_cn: string;
  public eps: number;
  public summary: string;
  public image: string;
  public air_date: string;
  public air_weekday: number;
  // @Deprecated
  public rss: string;
  // @Deprecated
  public eps_regex: string;
  public dmhy: string;
  public acg_rip: string;
  public status: number;
  public create_time: number;
  public update_time: number;
  // @Optional
  public cover: string;
  // @Optional
  public episodes: Episode[];
}
