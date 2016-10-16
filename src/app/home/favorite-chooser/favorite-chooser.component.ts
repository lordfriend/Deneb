import {Bangumi} from '../../entity/bangumi';
import {Component, Input} from '@angular/core';
import {FAVORITE_LABEL} from '../../entity/constants';
import {WatchService} from '../watch.service';


@Component({
  selector: 'favorite-chooser',
  template: require('./favorite-chooser.html')
})
export class FavoriteChooser {
  FAVORITE_LABEL = FAVORITE_LABEL;

  isChoosingFavorite = false;
  isSavingFavorite = false;

  @Input()
  bangumi: Bangumi;

  constructor(private watchService: WatchService) {}

  toggleFavoriteChooser() {
    this.isChoosingFavorite = !this.isChoosingFavorite;
  }

  chooseFavoriteStatus(status) {
    this.isChoosingFavorite = false;
    this.isSavingFavorite = true;
    this.watchService.favorite_bangumi(this.bangumi.id, status)
      .subscribe(() => {
        this.bangumi.favorite_status = status;
        console.log('update favorite successful');
      }, () => {
        console.log('update favorite error');
      }, () => {
        this.isSavingFavorite = false;
      });
  }

}
