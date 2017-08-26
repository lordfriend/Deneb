import { Routes } from '@angular/router';
import { TosComponent } from './tos/tos.component';
import { StaticContentComponent } from './static-content.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { DevelopersComponent } from './developers/developers.component';
import { AppsComponent } from './apps/apps.component';

export const staticContentRoutes: Routes = [
    {
        path: 'about',
        component: StaticContentComponent,
        children: [
            {
                path: 'tos',
                component: TosComponent
            },
            {
                path: 'privacy',
                component: PrivacyComponent
            },
            {
                path: 'developers',
                component: DevelopersComponent
            },
            {
                path: 'apps',
                component: AppsComponent
            }
        ]
    }
];
