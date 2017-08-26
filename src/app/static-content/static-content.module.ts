import { NgModule } from '@angular/core';
import { PrivacyComponent } from './privacy/privacy.component';
import { TosComponent } from './tos/tos.component';
import { StaticContentComponent } from './static-content.component';
import { RouterModule } from '@angular/router';
import { staticContentRoutes } from './static-content.routes';
import { ContactComponent } from './contact/contact.component';
import { AppsComponent } from './apps/apps.component';

@NgModule({
    declarations: [
        PrivacyComponent,
        TosComponent,
        StaticContentComponent,
        ContactComponent,
        AppsComponent
    ],
    imports: [
        RouterModule.forChild(staticContentRoutes)
    ]
})
export class StaticContentModule {

}
