import { Home } from './home.component';
import { DefaultComponent } from './default/default.component';
import { PlayEpisode } from './play-episode/play-episode.component';
import { BangumiList } from './bangumi-list/bangumi-list.component';
import { BangumiDetail } from './bangumi-detail/bangumi-detail.components';
import { FavoriteChooser } from './favorite-chooser/favorite-chooser.component';
import { NgModule } from '@angular/core';
import { HomeService } from './home.service';
import { HttpModule } from '@angular/http';
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
import { AlertDialogModule } from '../alert-dialog/alert-dialog.module';
import { ResponsiveImageModule } from '../responsive-image/responsive-image.module';
import { VideoPlayerModule } from '../video-player/video-player.module';
import { MyBangumiComponent } from './my-bangumi/my-bangumi.component';
import { BottomFloatBannerComponent } from './bottom-float-banner/bottom-float-banner.component';
import { BangumiListService } from './bangumi-list/bangumi-list.service';
import { UserCenterService } from './user-center/user-center.service';
import { ConfirmDialogModule } from '../confirm-dialog/index';
import { WebHookComponent } from './web-hook/web-hook.component';
import { PreviewVideoComponent } from './preview-video/preview-video.component';
import { FavoriteListComponent } from './favorite-list/favorite-list.component';


@NgModule({
    declarations: [
        Home,
        DefaultComponent,
        PlayEpisode,
        BangumiList,
        BangumiDetail,
        FavoriteChooser,
        BangumiCard,
        UserCenter,
        MyBangumiComponent,
        BottomFloatBannerComponent,
        WebHookComponent,
        PreviewVideoComponent,
        FavoriteListComponent
    ],
    providers: [
        HomeService,
        WatchService,
        ImageLoadingStrategy,
        BangumiListService,
        UserCenterService
    ],
    imports: [
        RouterModule.forChild(homeRoutes),
        BrowserModule,
        HttpModule,
        UIModule,
        CommonModule,
        DenebCommonPipes,
        ReactiveFormsModule,
        AlertDialogModule,
        ResponsiveImageModule,
        VideoPlayerModule,
        ConfirmDialogModule
    ]
})
export class HomeModule {

}
