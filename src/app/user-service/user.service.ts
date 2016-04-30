import {Injectable} from "angular2/core";
import {Http, Headers, RequestOptions} from "angular2/http";
import {Observable} from "rxjs/Observable";
import {User} from "../entity";


@Injectable()
export class UserService {
  private baseUrl = '/api/user';

  constructor(
    private _http: Http
  ){}

  register(user: User): Observable<any> {
    let queryUrl = this.baseUrl + '/register';
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});
    let body = JSON.stringify(user);
    return this._http.post(queryUrl, body, options)
      .map(res => res.json());
  }

  login(user: User): Observable<any> {
    let queryUrl = this.baseUrl + '/login';
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});
    let body = JSON.stringify(user);
    return this._http.post(queryUrl, body, options)
      .map(res => res.json());
  }

}
