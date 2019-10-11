import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Tag, Torrent} from './bangum-moe-entity';

@Injectable()
export class BangumiMoeService {
    private _baseUrl = 'https://bangumi.moe/api';

    constructor(private _http: HttpClient) {
    }

    fetchTagData(tags: string): Observable<Tag[]> {
        return this._http.post<Tag[]>(`${this._baseUrl}/tag/fetch`, {_ids: tags});
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
        return this._http.post<{count: number, page_count: number, torrents: Torrent[]}>(
            `/api/feed/bangumi-moe/torrent/search`,{
                tag_id: tag_ids
            });
    }

    searchTag(name: string): Observable<{success: boolean, found: boolean, tag: Tag[]}> {
        return this.userProxy<{success: boolean, found: boolean, tag: Tag[]}>(`${this._baseUrl}/tag/search`, 'POST', {
            name: name,
            keywords: true,
            multi: true
        });
    }

    private userProxy<T>(url: string, method: string, payload?: any): Observable<T> {
        return this._http.post<T>('/api/feed/bangumi-moe', {
            url: url,
            payload: payload,
            method: method
        });
    }
}
