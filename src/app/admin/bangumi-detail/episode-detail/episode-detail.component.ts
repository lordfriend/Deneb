import {Component, Input} from '@angular/core';
import {Episode} from "../../../entity/episode";
import {BangumiService} from "../../api/bangumi.service";
import {EpisodeThumbnail} from "../episode-thumbnail/episode-thumbnail.component";

@Component({
  selector: 'episode-detail',
  template: require('./episode-detail.html'),
  directives: [EpisodeThumbnail]
})
export class EpisodeDetail {

  episodeStatus = [
    {text: '未下载', labelColor: 'red'},
    {text: '下载中', labelColor: 'blue'},
    {text: '已下载', labelColor: 'teal'}
  ];

  @Input()
  episode: Episode;

  errorMessage: string;

  constructor(private _bangumiApi: BangumiService) {}

  updateEpisode(episode: Episode): void {
    this._bangumiApi.updateEpisode(episode)
      .subscribe(
        result => console.log(result),
        error => this.errorMessage = <any> error
      )
  }

}
