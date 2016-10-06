import {homeRoutes} from './home/home.routes';
// import {adminRoutes} from './admin/admin.routes';
import {Register} from './register/register.component';
import {Login} from './login/login.component';
import {ErrorComponent} from './error/error.component';
import {Routes} from '@angular/router';


export const appRoutes: Routes = [
  ...homeRoutes,
  // ...adminRoutes,
  {
    path: 'register',
    component: Register
  },
  {
    path: '',
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
