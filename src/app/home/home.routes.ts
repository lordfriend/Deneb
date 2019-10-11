import { Routes } from '@angular/router';
import { Home } from './home.component';
import { DefaultComponent } from './default/default.component';
import { PlayEpisode } from './play-episode/play-episode.component';
import { BangumiList } from './bangumi-list/bangumi-list.component';
import { BangumiDetail } from './bangumi-detail/bangumi-detail.components';
import { Authentication } from '../user-service/authentication.service';
import { UserCenter } from './user-center/user-center.component';
import { WebHookComponent } from './web-hook/web-hook.component';
import { PreviewVideoComponent } from './preview-video/preview-video.component';
import { FavoriteListComponent } from './favorite-list/favorite-list.component';
import { BangumiAccountBindingComponent } from './bangumi-account-binding/bangumi-account-binding.component';
export const homeRoutes: Routes = [
    {
        path: '',
        component: Home,
        data: {level: 0},
        canActivate: [Authentication],
        children: [
            {
                path: '',
                component: DefaultComponent
            },
            {
                path: 'play/:episode_id',
                component: PlayEpisode,
                data: {
                    refresh: false
                }
            },
            {
                path: 'bangumi/:bangumi_id',
                component: BangumiDetail,
                data: {
                    refresh: true
                }
            },
            {
                path: 'bangumi',
                component: BangumiList
            },
            {
                path: 'settings/user',
                component: UserCenter
            },
            {
                path: 'settings/web-hook',
                component: WebHookComponent
            },
            {
                path: 'settings/bangumi',
                component: BangumiAccountBindingComponent
            },
            {
                path: 'pv',
                component: PreviewVideoComponent
            },
            {
                path: 'favorite',
                component: FavoriteListComponent
            }
        ]
    },
];
