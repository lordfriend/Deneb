import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Admin} from './admin.component';
import {SearchBangumi} from './search-bangumi/search-bangumi.component';
import {ListBangumi} from './list-bangumi/list-bangumi.component';
import {BangumiDetail} from './bangumi-detail/bangumi-detail.component';
import {KeywordBuilder} from './bangumi-detail/keyword-builder/keyword-builder.component';
import {EpisodeDetail} from './bangumi-detail/episode-detail/episode-detail.component';
import {AdminService} from './admin.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {adminRoutes} from './admin.routes';
import {HttpModule} from '@angular/http';
import {FeedService} from './bangumi-detail/keyword-builder/feed.service';
import {Ng2SemanticModule} from '../../ng2-semantic';
import {AdminNavbar} from './admin-navbar/admin-navbar.component';
import {BangumiCard} from './bangumi-card/bangumi-card.component';
import {UIModule} from 'deneb-ui';
import {BangumiTypeNamePipe} from './bangumi-pipes/type-name-pipe';
import {UIImagePlaceholderModule} from '../image-placeholder/index';
import {ResultDetail} from './search-bangumi/result-detail/result-detail.component';
import {BangumiBasic} from './bangumi-detail/bangumi-basic/bangumi-basic.component';
import {BangumiStatusNamePipe} from './bangumi-pipes/status-name-pipe';
import {LibykPipe} from './bangumi-pipes/libyk-pipe';
import {BangumiMoeBuilder} from './bangumi-detail/bangumi-moe-builder/bangumi-moe-builder.component';
import {BangumiMoeService} from './bangumi-detail/bangumi-moe-builder/bangumi-moe.service';


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
        BangumiBasic,
        BangumiMoeBuilder
    ],
    providers: [
        AdminService,
        FeedService,
        BangumiMoeService
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(adminRoutes),
        HttpModule,
        Ng2SemanticModule,
        UIImagePlaceholderModule,
        UIModule
    ],
    entryComponents: [
        SearchBangumi,
        BangumiBasic,
        KeywordBuilder,
        EpisodeDetail,
        BangumiMoeBuilder,
    ]
})
export class AdminModule {
}
