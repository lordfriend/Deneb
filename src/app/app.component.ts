/*
 * Angular 2 decorators and services
 */
import {Component, ViewEncapsulation} from '@angular/core';
import {RouteConfig, Router} from '@angular/router-deprecated';

import {Admin} from "./admin";
import {Register} from "./register/register.component";
import {Login} from "./login/login.component";
import {UserService} from "./user-service";
import {User} from "./entity";
import {ErrorComponent} from "./error/error.component";
import {SecurityOutlet} from "./user-service/security-outlet.directive";
import {Authentication} from "./user-service/authentication.service";

require('./app.less');

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  pipes: [ ],
  providers: [UserService, Authentication],
  directives: [SecurityOutlet],
  template: `

    <main>
      <security-outlet login="/Login" unathorized="/ErrorComponent">
      </security-outlet>
    </main>
  `,
  encapsulation: ViewEncapsulation.None
})
@RouteConfig([
  { path: '/admin/...', name: 'Admin', component: Admin, data: {level: User.LEVEL_ADMIN}},
  { path: '/register', name: 'Register', component: Register},
  { path: '/forget', name: 'Forget', component: Register},
  { path: '/login', name: 'Login', component: Login},
  { path: '/error', name: 'Error', component: ErrorComponent}
])
export class App {
}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
