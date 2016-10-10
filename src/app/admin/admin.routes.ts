import {Routes} from '@angular/router';
import {Admin} from './admin.component';
import {SearchBangumi} from './search-bangumi/search-bangumi.component';
import {BangumiDetail} from './bangumi-detail/bangumi-detail.component';
import {ListBangumi} from './list-bangumi/list-bangumi.component';


export const adminRoutes: Routes = [
  {
    path: '',
    component: Admin,
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
