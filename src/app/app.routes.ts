import {RouterConfig} from '@angular/router';
import {homeRoutes} from './home/home.routes';
import {adminRoutes} from './admin/admin.routes';
import {Register} from './register/register.component';
import {Login} from './login/login.component';
import {ErrorComponent} from './error/error.component';


export const appRoutes:RouterConfig = [
  ...homeRoutes,
  ...adminRoutes,
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
