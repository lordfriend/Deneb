import { HttpClientModule } from '@angular/common/http';
import { FavoriteManagerService } from './favorite-manager.service';
import { Home } from './home.component';
import { DefaultComponent } from './default/default.component';
import { PlayEpisode } from './play-episode/play-episode.component';
import { BangumiList } from './bangumi-list/bangumi-list.component';
import { BangumiDetail } from './bangumi-detail/bangumi-detail.components';
import { FavoriteChooser } from './favorite-chooser/favorite-chooser.component';
import { NgModule } from '@angular/core';
import { HomeService } from './home.service';
import { UIModule } from 'deneb-ui';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { homeRoutes } from './home.routes';
import { WatchService } from './watch.service';
import { BrowserModule } from '@angular/platform-browser';
import { BangumiCard } from './bangumi-card/bangumi-card.component';
import { DenebCommonPipes } from '../pipes';
import { ImageLoadingStrategy } from './bangumi-card/image-loading-strategy.service';
import { UserCenter } from './user-center/user-center.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertDialogModule } from '../alert-dialog/alert-dialog.module';
import { ResponsiveImageModule } from '../responsive-image/responsive-image.module';
import { VideoPlayerModule } from '../video-player/video-player.module';
import { MyBangumiComponent } from './my-bangumi/my-bangumi.component';
import { BottomFloatBannerComponent } from './bottom-float-banner/bottom-float-banner.component';
import { BangumiListService } from './bangumi-list/bangumi-list.service';
import { UserCenterService } from './user-center/user-center.service';
import { ConfirmDialogModule } from '../confirm-dialog';
import { WebHookComponent } from './web-hook/web-hook.component';
import { PreviewVideoComponent } from './preview-video/preview-video.component';
import { FavoriteListComponent } from './favorite-list/favorite-list.component';
import { RatingComponent } from './rating/rating.component';
import { BrowserExtensionModule } from '../browser-extension/browser-extension.module';
import { MyReviewComponent } from './rating/my-review/my-review.component';
import { EditReviewDialogComponent } from './rating/edit-review-dialog/edit-review-dialog.component';
import { CommentComponent } from './play-episode/comment/comment.component';
import { CommentFormComponent } from './play-episode/comment/comment-form/comment-form.component';
import { EditCommentComponent } from './play-episode/comment/edit-comment/edit-comment.component';
import { BangumiAccountBindingComponent } from './bangumi-account-binding/bangumi-account-binding.component';
import { ConflictDialogComponent } from './favorite-chooser/conflict-dialog/conflict-dialog.component';
import { BangumiCharacterComponent } from './bangumi-extra-info/bangumi-character/bangumi-character.component';
import { BangumiStaffInfoComponent } from './bangumi-extra-info/bangumi-staff-info/bangumi-staff-info.component';
import { SynchronizeService } from './synchronize.service';
import { UserActionComponent } from './user-action/user-action.component';
import { UserActionPanelComponent } from './user-action/user-action-panel/user-action-panel.component';
import { BrowserExtensionTipComponent } from './user-action/browser-extension-tip/browser-extension-tip.component';
import { FeedbackComponent } from './play-episode/feedback/feedback.component';
import { RevealExtraComponent } from './play-episode/reveal-extra/reveal-extra.component';


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
        FavoriteListComponent,
        RatingComponent,
        MyReviewComponent,
        EditReviewDialogComponent,
        CommentComponent,
        CommentFormComponent,
        EditCommentComponent,
        BangumiAccountBindingComponent,
        ConflictDialogComponent,
        BangumiCharacterComponent,
        BangumiStaffInfoComponent,
        UserActionComponent,
        UserActionPanelComponent,
        BrowserExtensionTipComponent,
        FeedbackComponent,
        RevealExtraComponent
    ],
    providers: [
        HomeService,
        WatchService,
        ImageLoadingStrategy,
        BangumiListService,
        UserCenterService,
        SynchronizeService,
        FavoriteManagerService
    ],
    imports: [
        RouterModule.forChild(homeRoutes),
        BrowserModule,
        HttpClientModule,
        UIModule,
        CommonModule,
        DenebCommonPipes,
        ReactiveFormsModule,
        FormsModule,
        AlertDialogModule,
        ResponsiveImageModule,
        VideoPlayerModule,
        ConfirmDialogModule,
        BrowserExtensionModule
    ],
    entryComponents: [
        EditReviewDialogComponent,
        ConflictDialogComponent,
        UserActionPanelComponent,
        BrowserExtensionTipComponent,
        FeedbackComponent
    ]
})
export class HomeModule {

}
