import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../../helpers/base.service';
import { queryString } from '../../../helpers/url'
import { User } from '../../entity/user';

@Injectable()
export class UserManagerSerivce extends BaseService {
    private _baseUrl = '/api/user-manage';

    constructor(private _http: Http) {
        super()
    }

    listUser(params: {count: number, offset: number, minlevel?: number, query_field?: string, query_value?: string}): Observable<{data: User[], total: number}> {
        let queryParams = queryString(params);
        return this._http.get(`${this._baseUrl}/?${queryParams}`).pipe(
            map(res => res.json() as {data: User[], total: number}),
            catchError(this.handleError),);
    }

    promoteUser(user_id: string, toLevel: number): Observable<any> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({id: user_id, to_level: toLevel});
        return this._http.post(`${this._baseUrl}/promote`, body, options).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    listUnusedInviteCode(): Observable<string[]> {
        return this._http.get(`${this._baseUrl}/invite/unused`).pipe(
            map(res => res.json().data as string[]),
            catchError(this.handleError),);
    }

    createInviteCode(num: number = 1): Observable<string[]> {
        return this._http.post(`${this._baseUrl}/invite?num=${num}`, null).pipe(
            map(res => res.json().data as string[]),
            catchError(this.handleError),);
    }
}
