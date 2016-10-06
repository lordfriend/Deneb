import {NgModule} from '@angular/core'
import {Admin} from './admin.component';
import {SearchBangumi} from './search-bangumi/search-bangumi.component';
import {ListBangumi} from './list-bangumi/list-bangumi.component';
import {BangumiDetail} from './bangumi-detail/bangumi-detail.component';
import {KeywordBuilder} from './bangumi-detail/keyword-builder/keyword-builder.component';
import {EpisodeDetail} from './bangumi-detail/episode-detail/episode-detail.component';
import {EpisodeThumbnail} from './bangumi-detail/episode-thumbnail/episode-thumbnail.component';
import {AdminService} from './admin.service';
import {BrowserModule} from '@angular/platform-browser';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {adminRoutes} from './admin.routes';
import {HttpModule} from '@angular/http';
import {FeedService} from './bangumi-detail/keyword-builder/feed.service';


@NgModule({
  declarations: [Admin, SearchBangumi, ListBangumi, BangumiDetail, KeywordBuilder, EpisodeDetail, EpisodeThumbnail],
  providers: [AdminService, FeedService],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forChild(adminRoutes),
    HttpModule
  ]
})
export class AdminModule {
}
