import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {App} from './app.component';
import {AnalyticsService} from './analytics.service';
import {Authentication} from './user-service/authentication.service';
import {UserService} from './user-service/user.service';
import {RouterModule} from '@angular/router';
import {BrowserModule, Title} from '@angular/platform-browser';
import {appRoutes} from './app.routes';
import {Login} from './login/login.component';
import {Register} from './register/register.component';
import {ENV_PROVIDERS} from './environment';
import {ReactiveFormsModule} from '@angular/forms';
import {ErrorComponent} from './error/error.component';
import {HttpModule} from '@angular/http';
import {PlayerModule} from './home/player';
import {HOME_DECLARATIONS} from './home/index';
import {HomeService} from './home/home.service';
import {Ng2SemanticModule} from '../ng2-semantic';
import {WatchService} from './home/watch.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {UIImagePlaceholderModule} from './image-placeholder/index';
import {TaskService} from './admin/task-manager/task.service';
import {DenebCommonPipes} from './pipes/index';

@NgModule({
    declarations: [
        App,
        Login,
        Register,
        ErrorComponent,
        ...HOME_DECLARATIONS
    ],
    providers: [
        AnalyticsService,
        Authentication,
        UserService,
        HomeService,
        WatchService,
        Title,
        TaskService,
        ENV_PROVIDERS
    ],
    imports: [
        RouterModule.forRoot(appRoutes, {useHash: true}),
        BrowserModule,
        CommonModule,
        ReactiveFormsModule,
        HttpModule,
        PlayerModule,
        Ng2SemanticModule,
        BrowserAnimationsModule,
        UIImagePlaceholderModule,
        DenebCommonPipes
    ],
    bootstrap: [App]
})
export class AppModule {
}
