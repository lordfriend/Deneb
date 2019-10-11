import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../../helpers/base.service';
import { Announce } from '../../entity/announce';

@Injectable()
export class AnnounceService extends BaseService {

    private _baseUrl = '/api/announce';

    constructor(private _http: HttpClient) {
        super();
    }

    listAnnounce(position: number, offset: number, count: number, content?: string): Observable<{data: Announce[], total: number}> {
        return this._http.get<{data: Announce[], total: number}>(this._baseUrl, {
            params: {
                position: position + '',
                offset: offset + '',
                count: count + '',
                content: content
            }
        }).pipe(
            catchError(this.handleError),);
    }

    addAnnounce(announce: Announce): Observable<any> {
        return this._http.post<any>(this._baseUrl, announce).pipe(
            catchError(this.handleError),);
    }

    updateAnnounce(announce_id: string, announce: Announce): Observable<any> {
        return this._http.put<any>(`${this._baseUrl}/${announce_id}`, announce).pipe(
            catchError(this.handleError),);
    }

    deleteAnnounce(announce_id: string): Observable<any> {
        return this._http.delete<any>(`${this._baseUrl}/${announce_id}`).pipe(
            catchError(this.handleError),);
    }
}
