import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { BaseService } from '../../helpers/base.service';
import { User } from '../entity';


@Injectable()
export class UserService extends BaseService {
    private _baseUrl = '/api/user';

    private _userInfoSubject = new BehaviorSubject(null);

    constructor(
        private _http: HttpClient,
        private _router: Router
    ) {
        super();
        // console.log('init user service: #' + (Math.random()* 1000));
        this.getUserInfo().subscribe(() => {});
    }

    get userInfo(): Observable<User> {
        return this._userInfoSubject.asObservable();
    }

    register(user: User): Observable<any> {
        return this._http.post<any>(`${this._baseUrl}/register`, user).pipe(
            catchError(this.handleError),);
    }

    login(user: User): Observable<any> {
        return this._http.post<any>(`${this._baseUrl}/login`, user).pipe(
            mergeMap(() => {
                return this.getUserInfo();
            }),
            catchError(this.handleError),);
    }

    logout(): Observable<any> {
        return this._http.post<any>(`${this._baseUrl}/logout`, null).pipe(
            tap(() => {
                this._router.navigateByUrl('/login');
                this._userInfoSubject.next(null);
            }),
            catchError(this.handleError),);
    }

    getUserInfo(): Observable<User> {
        return this._http.get<{data: User}>(`${this._baseUrl}/info`).pipe(
            map(res => res.data),
            tap(user => {
                this._userInfoSubject.next(user);
            }),
            catchError(this.handleError),);
    }

    updateEmail(email, current_pass): Observable<any> {
        return this._http.post<any>(`${this._baseUrl}/email`, {email: email, password: current_pass}).pipe(
            mergeMap(() => {
                return this.getUserInfo();
            }),
            catchError(this.handleError),);
    }

    updatePass(password, new_password, new_password_repeat): Observable<any> {
        return this._http.post<any>(`${this._baseUrl}/update-pass`, {
            new_password: new_password,
            new_password_repeat: new_password_repeat,
            password: password
        }).pipe(
            catchError(this.handleError),);
    }

    requestResetPass(email: string): Observable<any> {
        return this._http.post<any>(`${this._baseUrl}/request-reset-pass`,{email: email}).pipe(
            catchError(this.handleError),);
    }

    resetPassword(new_pass: string, new_pass_repeat: string, token: string): Observable<any> {
        return this._http.post<any>(`${this._baseUrl}/reset-pass`, {
            new_pass: new_pass,
            new_pass_repeat: new_pass_repeat,
            token: token
        }).pipe(
            catchError(this.handleError),);
    }

    resendMail(): Observable<any> {
        return this._http.post<any>(`${this._baseUrl}/email/resend`, null).pipe(
            catchError(this.handleError),);
    }
}
