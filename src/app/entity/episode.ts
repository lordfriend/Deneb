export class Episode {

  public static EPISODE_TYPE_NORMAL: number = 0;
  public static EPISODE_TYPE_SPECIAL: number = 1;

  public id: string;
  public bangumi_id: string;
  public bgm_eps_id: number;
  public episode_no: number;
  public name: string;
  public name_cn: string;
  public duration: string;
  public airdate: string;
  public status: number;
  public torrent_id: string;
  public create_time: number;
  public update_time: number;

  public static fromRawData(rawData: any, episode_no?: number) {
    let episode = new Episode();
    episode.bgm_eps_id = rawData.id;
    episode.episode_no = episode_no;
    episode.name = rawData.name;
    episode.name_cn = rawData.name_cn;
    episode.duration = rawData.duration;
    episode.airdate = rawData.airdate;
    return episode;
  }
}
