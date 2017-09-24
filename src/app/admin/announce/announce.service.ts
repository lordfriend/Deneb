import { BaseService } from '../../../helpers/base.service';
import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Announce } from '../../entity/announce';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AnnounceService extends BaseService {

    private _baseUrl = '/api/announce';

    constructor(private _http: Http) {
        super();
    }

    listAnnounce(offset: number, count: number): Observable<{data: Announce[], total: number}> {
        return this._http.get(this._baseUrl, {
            params: {
                offset: offset,
                count: count
            }
        })
            .map(res => res.json())
            .catch(this.handleError);
    }

    addAnnounce(announce: Announce): Observable<any> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify(announce);
        return this._http.post(this._baseUrl, body, options)
            .map(res => res.json())
            .catch(this.handleError);
    }

    updateAnnounce(announce_id: string, announce: Announce): Observable<any> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify(announce);
        return this._http.put(`${this._baseUrl}/${announce_id}`, body, options)
            .map(res => res.json())
            .catch(this.handleError);
    }

    deleteAnnounce(announce_id: string): Observable<any> {
        return this._http.delete(`${this._baseUrl}/${announce_id}`)
            .map(res => res.json())
            .catch(this.handleError);
    }
}
