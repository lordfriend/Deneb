import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs';
import {Tag} from './bangum-moe-entity';

@Injectable()
export class BangumiMoeService {
    private _baseUrl = 'https://bangumi.moe/api';

    constructor(private _http: Http) {
    }

    fetchTagData(tags: string): Observable<Tag[]> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({_ids: tags});
        return this._http.post(`${this._baseUrl}/tag/fetch`, body, options)
            .map(res => res.json() as Tag[]);
    }

    popoluarBangumTags(): Observable<Tag[]> {
        return this._http.get(`${this._baseUrl}/tag/popbangumi`)
            .map(res => res.json() as Tag[]);
    }

    commonTags(): Observable<Tag[]> {
        return this._http.get(`${this._baseUrl}/tag/common`)
            .map(res => res.json() as Tag[]);
    }

    popularTeamTags(): Observable<Tag[]> {
        return this._http.get(`${this._baseUrl}/tag/team`)
            .map(res => res.json() as Tag[]);
    }
    miscTags(): Observable<Tag[]> {
        return this._http.get(`${this._baseUrl}/tag/misc`)
            .map(res => res.json() as Tag[]);
    }
}
