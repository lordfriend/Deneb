import {NgModule} from '@angular/core';
import {App} from './app.component';
import {AnalyticsService} from './analytics.service';
import {Authentication} from './user-service/authentication.service';
import {UserService} from './user-service/user.service';
import {RouterModule} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {appRoutes} from './app.routes';
import {Login} from './login/login.component';
import {Register} from './register/register.component';
import {ENV_PROVIDERS} from './environment';
import {ReactiveFormsModule} from '@angular/forms';
import {ErrorComponent} from './error/error.component';
import {HttpModule} from '@angular/http';
import {Ng2SemanticModule} from '../ng2-semantic';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TaskService} from './admin/task-manager/task.service';
import {DenebCommonPipes} from './pipes/index';
import {HomeModule} from './home/home.module';

@NgModule({
    declarations: [
        App,
        Login,
        Register,
        ErrorComponent
    ],
    providers: [
        AnalyticsService,
        Authentication,
        UserService,
        TaskService,
        ENV_PROVIDERS
    ],
    imports: [
        RouterModule.forRoot(appRoutes, {
            useHash: false
        }),
        BrowserModule,
        ReactiveFormsModule,
        HttpModule,
        Ng2SemanticModule,
        BrowserAnimationsModule,
        HomeModule
    ],
    bootstrap: [App]
})
export class AppModule {
}
