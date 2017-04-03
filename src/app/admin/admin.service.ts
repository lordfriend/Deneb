import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Bangumi, BangumiRaw} from '../entity';
import {Observable} from 'rxjs/Observable';
import {Episode} from '../entity/episode';
import {queryString} from '../../helpers/url'


@Injectable()
export class AdminService {

    private baseUrl = '/api/admin';

    constructor(private http: Http) {
    }

    handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server Error');
    }

    queryBangumi(bgmId: number): Observable<BangumiRaw> {
        let queryUrl = this.baseUrl + '/query/' + bgmId;
        return this.http.get(queryUrl)
            .map(res => new BangumiRaw(res.json()));
    }

    searchBangumi(name: string, type: number): Observable<Bangumi[]> {
        return this.http.get(`${this.baseUrl}/query?name=${name}&type=${type}`)
            .map(res => <Bangumi[]> res.json().data);
    }

    addBangumi(bangumiRaw: BangumiRaw): Observable<string> {
        let queryUrl = this.baseUrl + '/bangumi';
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify(bangumiRaw);
        return this.http.post(queryUrl, body, options)
            .map(res => res.json().data.id);
    }

    listBangumi(params: {page: number, count: number, orderBy: string, sort: string, name?: string}): Observable<{ data: Bangumi[], total: number }> {
        let queryParams = queryString({
            page: params.page,
            count: params.count,
            order_by: params.orderBy,
            sort: params.sort,
            name: name
        });
        return this.http.get(`${this.baseUrl}/bangumi?${queryParams}`)
            .map(res => res.json());
    }

    getBangumi(id: string): Observable<Bangumi> {
        let queryUrl = this.baseUrl + '/bangumi/' + id;
        return this.http.get(queryUrl)
            .map(res => res.json().data);
    }

    updateBangumi(bangumi: Bangumi): Observable<any> {
        let id = bangumi.id;
        let queryUrl = this.baseUrl + '/bangumi/' + id;
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify(bangumi);
        return this.http.put(queryUrl, body, options)
            .map(res => res.json());
    }

    getEpisode(episode_id: string): Observable<Episode> {
        return this.http.get(`${this.baseUrl}/episode/${episode_id}`)
            .map(res => <Episode> res.json().data);
    }

    addEpisode(episode: Episode): Observable<string> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify(episode);
        return this.http.post(`${this.baseUrl}/episode`, body, options)
            .map(res => <string> res.json().data.id);
    }

    updateEpisode(episode: Episode): Observable<any> {
        let id = episode.id;
        let queryUrl = this.baseUrl + '/episode/' + id;
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify(episode);
        return this.http.put(queryUrl, body, options)
            .map(res => res.json());
    }

    updateThumbnail(episode: Episode, time: string): Observable<any> {
        let id = episode.id;
        let queryUrl = this.baseUrl + '/episode/' + id + '/thumbnail';
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({time: time});
        return this.http.put(queryUrl, body, options)
            .map(res => res.json());
    }
}
