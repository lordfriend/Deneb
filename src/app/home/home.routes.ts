import { Routes } from '@angular/router';
import { Home } from './home.component';
import { DefaultComponent } from './default/default.component';
import { PlayEpisode } from './play-episode/play-episode.component';
import { BangumiList } from './bangumi-list/bangumi-list.component';
import { BangumiDetail } from './bangumi-detail/bangumi-detail.components';
import { Authentication } from '../user-service/authentication.service';
import { UserCenter } from './user-center/user-center.component';
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
                component: PlayEpisode
            },
            {
                path: 'bangumi/:bangumi_id',
                component: BangumiDetail
            },
            {
                path: 'bangumi',
                component: BangumiList
            },
            {
                path: 'settings/user',
                component: UserCenter
            }
        ]
    },
];
