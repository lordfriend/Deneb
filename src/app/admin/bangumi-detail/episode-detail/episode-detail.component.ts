import {Component, Input} from '@angular/core';
import {Episode} from "../../../entity/episode";
import {EpisodeThumbnail} from "../episode-thumbnail/episode-thumbnail.component";
import {AdminService} from '../../admin.service';

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

  constructor(private adminService: AdminService) {}

  updateEpisode(episode: Episode): void {
    this.adminService.updateEpisode(episode)
      .subscribe(
        result => console.log(result),
        error => this.errorMessage = <any> error
      )
  }

}
