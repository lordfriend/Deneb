import {Injectable} from 'angular2/core';
import {Http, Response, Headers, RequestOptions} from 'angular2/http';
import {Bangumi, BangumiRaw} from '../../entity';
import {Observable} from 'rxjs/Observable';


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
}
