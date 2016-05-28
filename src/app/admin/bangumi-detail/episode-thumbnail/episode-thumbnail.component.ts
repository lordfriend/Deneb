import {Component, Input} from '@angular/core';
import {Episode} from "../../../entity/episode";
import {BangumiService} from '../../api';

@Component({
  selector: 'episode-thumbnail',
  template: require('./episode-thumbnail.html'),
  host: {
    '[class.episode-thumbnail]': 'true'
  }
})
export class EpisodeThumbnail {

  @Input()
  episode: Episode;

  editorOpen: boolean = false;

  isSaving: boolean = false;

  time: string = '';

  constructor(private _bangumiService: BangumiService){}

  openEditor() {
    this.editorOpen = true;
  }
  closeEditor() {
    this.editorOpen = false;
  }

  updateThumbnail() {
    this.isSaving = true;
    this._bangumiService.updateThumbnail(this.episode, this.time)
      .subscribe(
        () => {
          this.editorOpen = false;
          this.isSaving = false;
        },
        () => {
          this.editorOpen = false;
          this.isSaving = false;
        }
      )
  }

}
