import {Bangumi} from "./bangumi";
import {Episode} from "./episode";
export class BangumiRaw extends Bangumi{
  public episodes: Episode[];
  constructor(rawData: any) {
    super();

    this.bgm_id = rawData.id;
    this.name = rawData.name;
    this.name_cn = rawData.name_cn;
    this.type = rawData.type;
    this.summary = rawData.summary;
    this.image = rawData.images.large;
    this.air_date = rawData.air_date;
    this.air_weekday = rawData.air_weekday;
    

    if(Array.isArray(rawData.eps) && rawData.eps.length > 0) {
      this.episodes = rawData.eps.filter(item => item.type === Episode.EPISODE_TYPE_NORMAL).map(item => Episode.fromRawData(item, item.sort));
      this.eps = this.episodes.length;
    } else {
      this.episodes = [];
      this.eps = 0;
    }

  }
}
