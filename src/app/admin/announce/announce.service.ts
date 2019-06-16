import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../../helpers/base.service';
import { Announce } from '../../entity/announce';

@Injectable()
export class AnnounceService extends BaseService {

    private _baseUrl = '/api/announce';

    constructor(private _http: Http) {
        super();
    }

    listAnnounce(position: number, offset: number, count: number, content?: string): Observable<{data: Announce[], total: number}> {
        return this._http.get(this._baseUrl, {
            params: {
                position: position,
                offset: offset,
                count: count,
                content: content
            }
        }).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    addAnnounce(announce: Announce): Observable<any> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify(announce);
        return this._http.post(this._baseUrl, body, options).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    updateAnnounce(announce_id: string, announce: Announce): Observable<any> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify(announce);
        return this._http.put(`${this._baseUrl}/${announce_id}`, body, options).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    deleteAnnounce(announce_id: string): Observable<any> {
        return this._http.delete(`${this._baseUrl}/${announce_id}`).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }
}
