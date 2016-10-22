import {Home} from './home.component';
import {DefaultComponent} from './default/default.component';
import {PlayEpisode} from './play-episode/play-episode.component';
import {BangumiList} from './bangumi-list/bangumi-list.component';
import {BangumiDetail} from './bangumi-detail/bangumi-detail.components';
import {WeekdayPipe} from '../pipes/weekday.pipe';
import {FavoriteChooser} from './favorite-chooser/favorite-chooser.component';

export const HOME_DECLARATIONS = [
  Home,
  DefaultComponent,
  PlayEpisode,
  BangumiList,
  BangumiDetail,
  WeekdayPipe,
  FavoriteChooser
];
