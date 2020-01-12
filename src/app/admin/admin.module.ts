import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Admin } from './admin.component';
import { UniversalBuilderComponent } from './bangumi-detail/universal-builder/universal-builder.component';
import { SearchBangumi } from './search-bangumi';
import { ListBangumi } from './list-bangumi/list-bangumi.component';
import { BangumiDetail } from './bangumi-detail';
import { KeywordBuilder } from './bangumi-detail/keyword-builder/keyword-builder.component';
import { EpisodeDetail } from './bangumi-detail/episode-detail/episode-detail.component';
import { AdminService } from './admin.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { adminRoutes } from './admin.routes';
import { FeedService } from './bangumi-detail/feed.service';
import { AdminNavbar } from './admin-navbar/admin-navbar.component';
import { BangumiCard } from './bangumi-card/bangumi-card.component';
import { UIModule } from 'deneb-ui';
import { BangumiTypeNamePipe } from './bangumi-pipes/type-name-pipe';
import { ResultDetail } from './search-bangumi/result-detail/result-detail.component';
import { BangumiBasic } from './bangumi-detail/bangumi-basic/bangumi-basic.component';
import { BangumiStatusNamePipe, VideoFileStatusNamePipe } from './bangumi-pipes/status-name-pipe';
import { LibykPipe } from './bangumi-pipes/libyk-pipe';
import { BangumiMoeBuilder } from './bangumi-detail/bangumi-moe-builder/bangumi-moe-builder.component';
import { BangumiMoeService } from './bangumi-detail/bangumi-moe-builder/bangumi-moe.service';
import { ParseJsonPipe } from './bangumi-pipes/parse-json.pipe';
import { ConfirmDialogModule } from '../confirm-dialog';
import { TaskManager } from './task-manager/task-manager.component';
import { UserManager } from './user-manager/user-manager.component';
import { TaskService } from './task-manager/task.service';
import { UserManagerSerivce } from './user-manager/user-manager.service';
import { UserPromoteModal } from './user-manager/user-promote-modal/user-promote-modal.component';
import { DenebCommonPipes } from '../pipes';
import { VideoFileModal } from './bangumi-detail/video-file-modal/video-file-modal.component';
import { ResponsiveImageModule } from '../responsive-image/responsive-image.module';
import { AnnounceComponent } from './announce/announce.component';
import { EditAnnounceComponent } from './announce/edit-announce/edit-announce.component';
import { AnnounceService } from './announce/announce.service';
import { ListBangumiService } from './list-bangumi/list-bangumi.service';
import { WebHookComponent } from './web-hook/web-hook.component';
import { UserServiceModule } from '../user-service';
import { WebHookService } from './web-hook/web-hook.service';
import { WebHookCardComponent } from './web-hook/web-hook-card/web-hook-card.component';
import { EditWebHookComponent } from './web-hook/edit-web-hook/edit-web-hook.component';
import { DpDatePickerModule } from 'ng2-date-picker';
import { NyaaPipe } from './bangumi-pipes/nyaa-pipe';
import { EditBangumiRecommendComponent } from './announce/edit-bangumi-recommend/edit-bangumi-recommend.component';


@NgModule({
    declarations: [
        Admin,
        SearchBangumi,
        ResultDetail,
        ListBangumi,
        BangumiDetail,
        KeywordBuilder,
        EpisodeDetail,
        AdminNavbar,
        BangumiCard,
        BangumiTypeNamePipe,
        BangumiStatusNamePipe,
        LibykPipe,
        NyaaPipe,
        ParseJsonPipe,
        BangumiBasic,
        BangumiMoeBuilder,
        VideoFileStatusNamePipe,
        TaskManager,
        UserManager,
        UserPromoteModal,
        VideoFileModal,
        AnnounceComponent,
        EditAnnounceComponent,
        WebHookComponent,
        WebHookCardComponent,
        EditWebHookComponent,
        EditBangumiRecommendComponent,
        UniversalBuilderComponent
    ],
    providers: [
        AdminService,
        FeedService,
        BangumiMoeService,
        TaskService,
        UserManagerSerivce,
        AnnounceService,
        ListBangumiService,
        WebHookService
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(adminRoutes),
        HttpClientModule,
        UIModule,
        ConfirmDialogModule,
        DenebCommonPipes,
        ResponsiveImageModule,
        UserServiceModule,
        DpDatePickerModule
    ],
    entryComponents: [
        SearchBangumi,
        BangumiBasic,
        KeywordBuilder,
        EpisodeDetail,
        BangumiMoeBuilder,
        UserPromoteModal,
        VideoFileModal,
        EditAnnounceComponent,
        EditWebHookComponent,
        EditBangumiRecommendComponent,
        UniversalBuilderComponent
    ]
})
export class AdminModule {
}
