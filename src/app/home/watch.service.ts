import {BaseService} from '../../helpers/base.service';
import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs';

@Injectable()
export class WatchService extends BaseService {

  private baseUrl = '/api/watch';

  private requestOptions: RequestOptions;

  constructor(private http: Http) {
    super();
    let headers = new Headers({'Content-Type': 'application/json'});
    this.requestOptions = new RequestOptions({headers: headers});
  }

  favorite_bangumi(bangumi_id: string, status: number): Observable<any> {
    let body = JSON.stringify({status: status});
    return this.http.post(`${this.baseUrl}/favorite/bangumi/${bangumi_id}`, body, this.requestOptions)
      .map(res => res.json())
      .catch(this.handleError)
  }

  episode_history(bangumi_id: string, episode_id: string, last_watch_position: number, percentage: number, is_finished: boolean): Observable<any> {
    let body = JSON.stringify({
      bangumi_id: bangumi_id,
      last_watch_position: last_watch_position,
      is_finished: is_finished,
      percentage: percentage
    });
    return this.http.post(`${this.baseUrl}/history/${episode_id}`, body, this.requestOptions)
      .map(res => res.json())
      .catch(this.handleError)
  }
}
