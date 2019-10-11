import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../../helpers/base.service';
import { queryString } from '../../../helpers/url'
import { User } from '../../entity';

@Injectable()
export class UserManagerSerivce extends BaseService {
    private _baseUrl = '/api/user-manage';

    constructor(private _http: HttpClient) {
        super()
    }

    listUser(params: {
        count: number,
        offset: number,
        minlevel?: number,
        query_field?: string,
        query_value?: string
    }): Observable<{data: User[], total: number}> {
        let queryParams = queryString(params);
        return this._http.get<{data: User[], total: number}>(`${this._baseUrl}/?${queryParams}`).pipe(
            catchError(this.handleError),);
    }

    promoteUser(user_id: string, toLevel: number): Observable<any> {
        return this._http.post<any>(`${this._baseUrl}/promote`, {id: user_id, to_level: toLevel}).pipe(
            catchError(this.handleError),);
    }

    listUnusedInviteCode(): Observable<string[]> {
        return this._http.get<{data: string[]}>(`${this._baseUrl}/invite/unused`).pipe(
            map(res => res.data),
            catchError(this.handleError),);
    }

    createInviteCode(num: number = 1): Observable<string[]> {
        return this._http.post<{data: string[]}>(`${this._baseUrl}/invite?num=${num}`, null).pipe(
            map(res => res.data),
            catchError(this.handleError),);
    }
}
