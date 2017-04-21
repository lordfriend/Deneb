import {Injectable} from '@angular/core';
import {BaseService} from '../../../helpers/base.service';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {User} from '../../entity/user';
import {queryString} from '../../../helpers/url'

@Injectable()
export class UserManagerSerivce extends BaseService {
    private _baseUrl = '/api/user-manage';

    constructor(private _http: Http) {
        super()
    }

    listUser(params: {name?: string, count: number, offset: number}): Observable<{data: User[], total: number}> {
        let queryParams = queryString(params);
        return this._http.get(`${this._baseUrl}/?${queryParams}`)
            .map(res => res.json() as {data: User[], total: number})
            .catch(this.handleError);
    }

    promoteUser(user_id: string, toLevel: number): Observable<any> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({id: user_id, to_level: toLevel});
        return this._http.post(`${this._baseUrl}/promote`, body, options)
            .map(res => res.json())
            .catch(this.handleError);
    }

    listUnusedInviteCode(): Observable<string[]> {
        return this._http.get(`${this._baseUrl}/invite/unused`)
            .map(res => res.json().data as string[])
            .catch(this.handleError);
    }

    createInviteCode(num: number = 1): Observable<string[]> {
        return this._http.post(`${this._baseUrl}/invite?num=${num}`, null)
            .map(res => res.json().data as string[])
            .catch(this.handleError);
    }
}
