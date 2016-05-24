import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {BaseService} from "../services/base.service";
import {Observable} from "rxjs/Observable";
import {Episode} from '../entity/episode';

@Injectable()
export class HomeService extends BaseService {

  private _baseUrl = '/api/home';

  constructor(
    private _http: Http
  ){
    super();
  }

  recentEpisodes(days?: number): Observable<Episode[]> {
    let queryUrl = this._baseUrl + '/recent';
    if(days) {
      queryUrl = queryUrl + '?days=' + days;
    }
    return this._http.get(queryUrl)
      .map(res => <Episode[]> res.json())
      .catch(this.handleError);
  }
}
