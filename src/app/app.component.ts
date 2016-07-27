/*
 * Angular 2 decorators and services
 */
import {Component, ViewEncapsulation} from '@angular/core';

import {UserService} from "./user-service";
// import {SecurityOutlet} from "./_user-service/security-outlet.directive";
import {Authentication} from "./user-service/authentication.service";

require('./app.less');

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  pipes: [ ],
  providers: [UserService],
  // directives: [SecurityOutlet],
  template: `

    <main>
      <router-outlet>
      </router-outlet>
    </main>
  `,
  encapsulation: ViewEncapsulation.None
})
export class App {
}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
