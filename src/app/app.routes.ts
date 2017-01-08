import {homeRoutes} from './home/home.routes';
import {Register} from './register/register.component';
import {Login} from './login/login.component';
import {ErrorComponent} from './error/error.component';
import {Routes} from '@angular/router';
import {Authentication} from './user-service/authentication.service';


export const appRoutes: Routes = [
  ...homeRoutes,
  {
    path: 'admin',
    data: {level: 2},
    canActivate: [Authentication],
    loadChildren: './admin#AdminModule'
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'forget',
    component: Register
  },
  {
    path: 'error',
    component: ErrorComponent
  }
];
