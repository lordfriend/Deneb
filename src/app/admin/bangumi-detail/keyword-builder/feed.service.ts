import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../../../helpers/base.service';

@Injectable()
export class FeedService extends BaseService {

  private baseUrl = '/api/feed';

  constructor(private http: HttpClient) {
    super()
  }

  queryDmhy(keywords: string): Observable<{title: string, eps_no: number}[]> {
    return this.http.get<{data: {title: string, eps_no: number}[], status: number}>(`${this.baseUrl}/dmhy/${keywords}`).pipe(
      map(res => res.data),
      catchError(this.handleError),);
  }

  queryAcgrip(keywords: string): Observable<{title: string, eps_no: number}[]> {
    return this.http.get<{data: {title: string, eps_no: number}[], status: number}>(`${this.baseUrl}/acg-rip/${keywords}`).pipe(
      map(res =>  res.data),
      catchError(this.handleError),);
  }

  queryLibyk_so({t, q}: {t: string, q: string}): Observable<{title: string, eps_no: number}[]> {
    return this.http.get<{data: {title: string, eps_no: number}[], status: number}> (`${this.baseUrl}/libyk-so?t=${t}&q=${q}`).pipe(
      map(res => res.data),
      catchError(this.handleError),);
  }

  queryNyaa(qs: string): Observable<{title: string, eps_no: number}[]> {
      return this.http.post<{data: {title: string, eps_no: number}[], status: number}>(`${this.baseUrl}/nyaa`, {qs: qs}).pipe(
          map(res => res.data),
          catchError(this.handleError),);
  }

}
