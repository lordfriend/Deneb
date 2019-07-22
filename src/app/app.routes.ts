import { homeRoutes } from './home/home.routes';
import { Register } from './register/register.component';
import { Login } from './login/login.component';
import { ErrorComponent } from './error/error.component';
import { Routes } from '@angular/router';
import { Authentication } from './user-service';
import { EmailConfirm } from './email-confirm/email-confirm.component';
import { ForgetPass } from './forget-pass/forget-pass.component';
import { ResetPass } from './reset-pass/reset-pass.component';
import { staticContentRoutes } from './static-content/static-content.routes';


export const appRoutes: Routes = [
    ...homeRoutes,
    {
        path: 'admin',
        data: {level: 2},
        canActivate: [Authentication],
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
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
        component: ForgetPass
    },
    {
        path: 'reset-pass',
        component: ResetPass
    },
    {
        path: 'error',
        component: ErrorComponent
    },
    {
        path: 'email-confirm',
        canActivate: [Authentication],
        component: EmailConfirm
    },
    ...staticContentRoutes
];
