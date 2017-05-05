import { Home } from './home.component';
import { DefaultComponent } from './default/default.component';
import { PlayEpisode } from './play-episode/play-episode.component';
import { BangumiList } from './bangumi-list/bangumi-list.component';
import { BangumiDetail } from './bangumi-detail/bangumi-detail.components';
import { FavoriteChooser } from './favorite-chooser/favorite-chooser.component';
import { NgModule } from '@angular/core';
import { HomeService } from './home.service';
import { PlayerModule } from './player/player.module';
import { HttpModule } from '@angular/http';
import { UIImagePlaceholderModule } from '../image-placeholder/index';
import { UIModule } from 'deneb-ui';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { homeRoutes } from './home.routes';
import { WatchService } from './watch.service';
import { BrowserModule } from '@angular/platform-browser';
import { BangumiCard } from './bangumi-card/bangumi-card.component';
import { DenebCommonPipes } from '../pipes/index';
import { ImageLoadingStrategy } from './bangumi-card/image-loading-strategy.service';
import { UserCenter } from './user-center/user-center.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
    declarations: [
        Home,
        DefaultComponent,
        PlayEpisode,
        BangumiList,
        BangumiDetail,
        FavoriteChooser,
        BangumiCard,
        UserCenter
    ],
    providers: [
        HomeService,
        WatchService,
        ImageLoadingStrategy
    ],
    imports: [
        RouterModule.forChild(homeRoutes),
        BrowserModule,
        PlayerModule,
        HttpModule,
        UIImagePlaceholderModule,
        UIModule,
        CommonModule,
        DenebCommonPipes,
        ReactiveFormsModule
    ]
})
export class HomeModule {

}
