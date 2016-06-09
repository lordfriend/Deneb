import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Bangumi, BangumiRaw} from '../../entity';
import {Observable} from 'rxjs/Observable';
import {Episode} from "../../entity/episode";


@Injectable()
export class BangumiService {

  private baseUrl = '/api/admin';

  constructor(
    private http: Http
  ){}

  handleError(error: Response) {
    console.error(error);
    return Observable.throw(error.json().error || 'Server Error');
  }

  queryBangumi(bgmId: number): Observable<BangumiRaw> {
    let queryUrl = this.baseUrl + '/query/' + bgmId;
    return this.http.get(queryUrl)
      .map(res => new BangumiRaw(res.json()));
  }

  searchBangumi(name: string): Observable<Bangumi[]> {
    let queryUrl = this.baseUrl + '/query?name=' + name;
    return this.http.get(queryUrl)
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

  listBangumi(page: number, count: number, name?: string): Observable<{data: Bangumi[], total: number}> {
    let queryUrl = this.baseUrl + '/bangumi?page=' + page + '&count=' + count;
    if(name) {
      queryUrl += '&name=' + name;
    }
    return this.http.get(queryUrl)
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
