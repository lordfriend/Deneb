import { NgModule } from '@angular/core';
import { App } from './app.component';
import { AnalyticsService } from './analytics.service';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { appRoutes } from './app.routes';
import { Login } from './login/login.component';
import { Register } from './register/register.component';
import { ENV_PROVIDERS } from './environment';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent } from './error/error.component';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TaskService } from './admin/task-manager/task.service';
import { HomeModule } from './home/home.module';
import { EmailConfirmModule } from './email-confirm/email-confirm.module';
import { ForgetPassModule } from './forget-pass/forget-pass.module';
import { ResetPassModule } from './reset-pass/reset-pass.module';
import { UserServiceModule } from './user-service/index';

@NgModule({
    declarations: [
        App,
        Login,
        Register,
        ErrorComponent
    ],
    providers: [
        AnalyticsService,
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
        BrowserAnimationsModule,
        HomeModule,
        EmailConfirmModule,
        ForgetPassModule,
        ResetPassModule,
        UserServiceModule
    ],
    bootstrap: [App]
})
export class AppModule {
}
