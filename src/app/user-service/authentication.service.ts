
import {of as observableOf,  Observable } from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { User } from '../entity';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthError } from '../../helpers/error/AuthError';


@Injectable()
export class Authentication implements CanActivate {

    user: User;

    constructor(private _userService: UserService, private router: Router) {
        this._userService.userInfo
            .subscribe(
                user => {
                    this.user = user;
                }
            );
    }

    public invalidateUser(): void {
        this.user = null;
    }

    private getUserInfo(): Observable<User> {
        if (this.user) {
            return observableOf(this.user);
        } else {
            return this._userService.getUserInfo().pipe(
                map((user: User) => {
                    this.user = user;
                    return user;
                }));
        }
    }

    private hasPermission(route: ActivatedRouteSnapshot): boolean {
        if (route.data && typeof route.data['level'] !== 'undefined') {
            return this.user.level >= route.data['level'];
        } else {
            return true;
        }
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        let sourceUrl = state.url;
        return this.getUserInfo().pipe(
            map(() => {
                if (this.hasPermission(route)) {
                    return true;
                } else {
                    this.router.navigate(['/error', {message: AuthError.PERMISSION_DENIED, status: 403}]);
                    return false;
                }
            }),
            catchError((error) => {
                console.log(error, `Is AuthError: ${error instanceof AuthError}`);
                if (error instanceof AuthError) {
                    if (sourceUrl === '/') {
                        this.router.navigate(['/login']);
                    } else {
                        this.router.navigate(['/login', {sourceUrl: sourceUrl}]);
                    }
                } else {
                    this.router.navigate(['/error', {message: error.message, status: error.status}]);
                }
                return observableOf(false);
            }),);
    }
}
