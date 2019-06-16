
import {tap, mergeMap, catchError, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable ,  BehaviorSubject } from 'rxjs';
import { User } from '../entity';
import { BaseService } from '../../helpers/base.service';
import { Router } from '@angular/router';


@Injectable()
export class UserService extends BaseService {
    private _baseUrl = '/api/user';

    private _userInfoSubject = new BehaviorSubject(null);

    constructor(
        private _http: Http,
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
        let queryUrl = this._baseUrl + '/register';
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify(user);
        return this._http.post(queryUrl, body, options).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    login(user: User): Observable<any> {
        let queryUrl = this._baseUrl + '/login';
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify(user);
        return this._http.post(queryUrl, body, options).pipe(
            mergeMap(() => {
                return this.getUserInfo();
            }),
            catchError(this.handleError),);
    }

    logout(): Observable<any> {
        return this._http.post(`${this._baseUrl}/logout`, null, null).pipe(
            tap(() => {
                this._router.navigateByUrl('/login');
                this._userInfoSubject.next(null);
            }),
            catchError(this.handleError),);
    }

    getUserInfo(): Observable<User> {
        let queryUrl = this._baseUrl + '/info';
        return this._http.get(queryUrl).pipe(
            map(res => <User>res.json().data),
            tap(user => {
                this._userInfoSubject.next(user);
            }),
            catchError(this.handleError),);
    }

    updateEmail(email, current_pass): Observable<any> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({email: email, password: current_pass});
        return this._http.post(`${this._baseUrl}/email`, body, options).pipe(
            mergeMap(() => {
                return this.getUserInfo();
            }),
            catchError(this.handleError),);
    }

    updatePass(password, new_password, new_password_repeat): Observable<any> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({new_password: new_password, new_password_repeat: new_password_repeat, password: password});
        return this._http.post(`${this._baseUrl}/update-pass`, body, options).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    requestResetPass(email: string) {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({email: email});
        return this._http.post(`${this._baseUrl}/request-reset-pass`, body, options).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    resetPassword(new_pass: string, new_pass_repeat: string, token: string): Observable<any> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify({
            new_pass: new_pass,
            new_pass_repeat: new_pass_repeat,
            token: token
        });
        return this._http.post(`${this._baseUrl}/reset-pass`, body, options).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    resendMail() {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this._http.post(`${this._baseUrl}/email/resend`, null, options).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }
}
