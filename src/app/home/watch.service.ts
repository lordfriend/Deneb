import {BaseService} from '../../facade/base.service';
import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs';

@Injectable()
export class WatchService extends BaseService {

  private baseUrl = '/api/watch';

  constructor(private http: Http) {
    super();
  }

  favorite_bangumi(bangumi_id, status): Observable<any> {
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});
    let body = JSON.stringify({status: status});
    return this.http.post(`${this.baseUrl}/favorite/bangumi/${bangumi_id}`, body, options)
      .map(res => res.json())
      .catch(this.handleError)
  }
}
