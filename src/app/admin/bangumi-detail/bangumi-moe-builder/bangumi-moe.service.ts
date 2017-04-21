import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs';
import {Tag, Torrent} from './bangum-moe-entity';

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

    searchTorrent(tag_ids: string[], page: number): Observable<{count: number, page_count: number, torrents: Torrent[]}> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({tag_id: tag_ids});
        return this._http.post(`/api/feed/bangumi-moe/torrent/search`, body, options)
            .map(res => res.json() as {count: number, page_count: number, torrents: Torrent[]});
    }

    searchTag(name: string): Observable<{success: boolean, found: boolean, tag: Tag[]}> {
        return this.userProxy<{success: boolean, found: boolean, tag: Tag[]}>(`${this._baseUrl}/tag/search`, {
            name: name,
            keywords: true,
            multi: true
        });
    }

    private userProxy<T>(url: string, payload: any): Observable<T> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({
            url: url,
            payload: payload
        });
        return this._http.post('/api/feed/bangumi-moe', body, options)
            .map(res => res.json() as T);
    }
}
