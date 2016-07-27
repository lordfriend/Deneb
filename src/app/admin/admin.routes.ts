import {RouterConfig} from '@angular/router';
import {Admin} from './admin.component';
import {SearchBangumi} from './search-bangumi/search-bangumi.component';
import {BangumiDetail} from './bangumi-detail/bangumi-detail.component';
import {ListBangumi} from './list-bangumi/list-bangumi.component';
import {Authentication} from '../user-service/authentication.service';


export const adminRoutes: RouterConfig = [
  {
    path: 'admin',
    component: Admin,
    data: {level: 2},
    canActivate: [Authentication],
    children: [
      {
        path: '',
        redirectTo: 'bangumi',
        pathMatch: 'full'
      },
      {
        path: 'search',
        component: SearchBangumi
      },
      {
        path: 'search/:bgm_id',
        component: BangumiDetail
      },
      {
        path: 'bangumi',
        component: ListBangumi
      },
      {
        path: 'bangumi/:id',
        component: BangumiDetail
      }
    ]
  }
];
