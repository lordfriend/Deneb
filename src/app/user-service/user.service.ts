import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from '../entity';
import { BaseService } from '../../helpers/base.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class UserService extends BaseService {
    private _baseUrl = '/api/user';

    private _userInfoSubject = new BehaviorSubject(null);

    constructor(
        private _http: Http
    ) {
        super();
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
        return this._http.post(queryUrl, body, options)
            .map(res => res.json())
            .catch(this.handleError);
    }

    resetPassword(user: User): Observable<any> {
        let queryUrl = this._baseUrl + '/reset_pass';
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify(user);
        return this._http.post(queryUrl, body, options)
            .map(res => res.json())
            .catch(this.handleError);
    }

    login(user: User): Observable<any> {
        let queryUrl = this._baseUrl + '/login';
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify(user);
        return this._http.post(queryUrl, body, options)
            .map(res => res.json())
            .catch(this.handleError);
    }

    logout(): Observable<any> {
        return this._http.post(`${this._baseUrl}/logout`, null, null)
            .map(res => res.json())
            .do(() => {
                this._userInfoSubject.next(null);
            })
            .catch(this.handleError);
    }

    getUserInfo(): Observable<User> {
        let queryUrl = this._baseUrl + '/info';
        return this._http.get(queryUrl)
            .map(res => <User>res.json().data)
            .do(user => {
                this._userInfoSubject.next(user);
            })
            .catch(this.handleError);
    }

    updateEmail(email, current_pass): Observable<any> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({email: email, password: current_pass});
        return this._http.post(`${this._baseUrl}/email`, body, options)
            .flatMap(() => {
                return this.getUserInfo();
            })
            .catch(this.handleError);
    }

    updatePass(current_pass, new_pass, new_pass_repeat): Observable<any> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({new_pass: new_pass, new_pass_repeat: new_pass_repeat, password: current_pass});
        return this._http.post(`${this._baseUrl}/update_pass`, body, options)
            .map(res => res.json())
            .catch(this.handleError);
    }

}
