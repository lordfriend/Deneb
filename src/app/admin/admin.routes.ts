import {Routes} from '@angular/router';
import {Admin} from './admin.component';
import {BangumiDetail} from './bangumi-detail/bangumi-detail.component';
import {ListBangumi} from './list-bangumi/list-bangumi.component';
import {TaskManager} from './task-manager/task-manager.component';


export const adminRoutes: Routes = [
    {
        path: '',
        component: Admin,
        children: [
            {
                path: 'bangumi/:id',
                component: BangumiDetail
            },
            {
                path: 'bangumi',
                component: ListBangumi
            },
            {
                path: 'task',
                component: TaskManager
            },
            {
                path: '',
                redirectTo: 'bangumi',
                pathMatch: 'full'
            }
        ]
    }
];
