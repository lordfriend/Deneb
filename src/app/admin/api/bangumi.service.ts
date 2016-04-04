import {Injectable} from 'angular2/core';
import {Http, Response} from 'angular2/http';
import {Bangumi} from '../../entity';
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

  queryBangumi(bgmId: number): Observable<Bangumi> {
    let queryUrl = this.baseUrl + '/query/' + bgmId;
    return this.http.get(queryUrl)
      .map(res => <Bangumi> res.json().data);
  }

  searchBangumi(name: string): Observable<Bangumi[]> {
    let queryUrl = this.baseUrl + '/query?name=' + name;
    return this.http.get(queryUrl)
      .map(res => <Bangumi[]> res.json().data);
  }
}
