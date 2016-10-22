export class WatchProgress {
  id: string;
  bangumi_id: string;
  episode_id: string;
  user_id: string;
  watch_status: number;
  last_watch_position: number;
  last_watch_time: number;
  percentage: number;

  static WISH = 1;
  static WATCHED = 2;
  static WATCHING = 3;
  static PAUSE = 4;
  static ABANDONED = 5;
}
