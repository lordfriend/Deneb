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
        return this.userProxy<Tag[]>(`${this._baseUrl}/tag/popbangumi`, 'GET');
    }

    commonTags(): Observable<Tag[]> {
        return this.userProxy(`${this._baseUrl}/tag/common`, 'GET');
    }

    popularTeamTags(): Observable<Tag[]> {
        return this.userProxy(`${this._baseUrl}/tag/team`, 'GET');
    }

    miscTags(): Observable<Tag[]> {
        return this.userProxy(`${this._baseUrl}/tag/misc`, 'GET');
    }

    searchTorrent(tag_ids: string[], page: number): Observable<{count: number, page_count: number, torrents: Torrent[]}> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({tag_id: tag_ids});
        return this._http.post(`/api/feed/bangumi-moe/torrent/search`, body, options)
            .map(res => res.json() as {count: number, page_count: number, torrents: Torrent[]});
    }

    searchTag(name: string): Observable<{success: boolean, found: boolean, tag: Tag[]}> {
        return this.userProxy<{success: boolean, found: boolean, tag: Tag[]}>(`${this._baseUrl}/tag/search`, 'POST', {
            name: name,
            keywords: true,
            multi: true
        });
    }

    private userProxy<T>(url: string, method: string, payload?: any): Observable<T> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({
            url: url,
            payload: payload,
            method: method
        });
        return this._http.post('/api/feed/bangumi-moe', body, options)
            .map(res => res.json() as T);
    }
}
