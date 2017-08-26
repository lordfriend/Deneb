import { Routes } from '@angular/router';
import { TosComponent } from './tos/tos.component';
import { StaticContentComponent } from './static-content.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ContactComponent } from './contact/contact.component';
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
                path: 'contact',
                component: ContactComponent
            },
            {
                path: 'apps',
                component: AppsComponent
            }
        ]
    }
];
