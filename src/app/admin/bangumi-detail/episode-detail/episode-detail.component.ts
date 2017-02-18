import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Episode} from "../../../entity/episode";
import {EpisodeThumbnail} from "../episode-thumbnail/episode-thumbnail.component";
import {AdminService} from '../../admin.service';

@Component({
  selector: 'episode-detail',
  templateUrl: './episode-detail.html',
})
export class EpisodeDetail {

  episodeStatus = [
    {text: '未下载', labelColor: 'red'},
    {text: '下载中', labelColor: 'blue'},
    {text: '已下载', labelColor: 'teal'}
  ];

  @Input()
  episode: Episode;

  @Output()
  onDelete = new EventEmitter<Episode>();

  @Output()
  onAdded = new EventEmitter<string>();

  errorMessage: string;

  uploadProgress: number;

  constructor(private adminService: AdminService) {}

  saveEpisode(episode: Episode): void {
    if (episode.id) {
      this.updateEpisode(episode);
    } else {
      this.adminService.addEpisode(episode)
        .subscribe(
          (episode_id: string) => {
            this.onAdded.emit(episode_id);
          },
          error => this.errorMessage = <any> error
        );
    }
  }

  updateEpisode(episode: Episode): void {
    this.adminService.updateEpisode(episode)
      .subscribe(
        result => console.log(result),
        error => this.errorMessage = <any> error
      )
  }

  onFileSelect(files: File[]) {
    if(files.length > 0) {
      let formData: FormData = new FormData();
      let xhr: XMLHttpRequest = new XMLHttpRequest();
      let intervalId;
      formData.append('file', files[0], files[0].name);
      xhr.onreadystatechange = () => {
        if(xhr.readyState === 4) {
          if(xhr.status === 200) {
            console.log('upload success');
          } else {
            console.log(xhr.response);
          }
          clearInterval(intervalId);
        }
      };

      intervalId = setInterval(() => {}, 500);

      xhr.upload.onprogress = (event) => {
        this.uploadProgress = Math.round(event.loaded / event.total * 100);
      };

      xhr.open('POST', `/api/admin/episode/${this.episode.id}/upload`, true);
      xhr.send(formData);
    }
  }

  deleteEpisode() {
    if (this.episode.id) {
      return;
    }
    this.onDelete.emit(this.episode);
  }

}
