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
    Title,
    ENV_PROVIDERS
  ],
  imports: [
    RouterModule.forRoot(appRoutes, {useHash: true}),
    BrowserModule,
    CommonModule,
    ReactiveFormsModule,
    HttpModule,
    PlayerModule,
    Ng2SemanticModule
  ],
  bootstrap: [App]
})
export class AppModule {
}
