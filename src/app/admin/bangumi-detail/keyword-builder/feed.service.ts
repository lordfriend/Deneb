import {Observable} from 'rxjs/Rx';
import {BaseService} from '../../../services/base.service';
import {Http} from '@angular/http';
import {Injectable} from '@angular/core';

@Injectable()
export class FeedService extends BaseService {

  private baseUrl = '/api/feed';

  constructor(private http: Http) {
    super()
  }

  queryDmhy(keywords: string): Observable<{title: string, eps_no: number}[]> {
    let query_url = `${this.baseUrl}/dmhy/${keywords}`;

    return this.http.get(query_url)
      .map(res => <{title: string, eps_no: number}[]> res.json().data)
      .catch(this.handleError)
  }

  queryAcgrip(keywords): Observable<{title: string, eps_no: number}[]> {
    let query_url = `${this.baseUrl}/acg-rip/${keywords}`;

    return this.http.get(query_url)
      .map(res => <{title: string, eps_no: number}[]> res.json().data)
      .catch(this.handleError)
  }

}
