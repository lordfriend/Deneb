import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../../../helpers/base.service';

@Injectable()
export class FeedService extends BaseService {

  private baseUrl = '/api/feed';

  constructor(private http: Http) {
    super()
  }

  queryDmhy(keywords: string): Observable<{title: string, eps_no: number}[]> {
    let query_url = `${this.baseUrl}/dmhy/${keywords}`;

    return this.http.get(query_url).pipe(
      map(res => <{title: string, eps_no: number}[]> res.json().data),
      catchError(this.handleError),);
  }

  queryAcgrip(keywords: string): Observable<{title: string, eps_no: number}[]> {
    let query_url = `${this.baseUrl}/acg-rip/${keywords}`;

    return this.http.get(query_url).pipe(
      map(res => <{title: string, eps_no: number}[]> res.json().data),
      catchError(this.handleError),);
  }

  queryLibyk_so({t, q}: {t: string, q: string}): Observable<{title: string, eps_no: number}[]> {
    return this.http.get(`${this.baseUrl}/libyk-so?t=${t}&q=${q}`).pipe(
      map(res => <{title: string, eps_no: number}> res.json().data),
      catchError(this.handleError),);
  }

  queryNyaa(qs: string): Observable<{title: string, eps_no: number}[]> {
      let header = new Headers({'Content-Type': 'application/json'});
      let requestOptions = new RequestOptions({headers: header});
      let body = JSON.stringify({qs: qs});
      return this.http.post(`${this.baseUrl}/nyaa`, body, requestOptions).pipe(
          map(res => <{title: string, eps_no: number}[]> res.json().data),
          catchError(this.handleError),);
  }

}
