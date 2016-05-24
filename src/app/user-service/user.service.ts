import {Injectable} from "@angular/core";
import {Http, Headers, RequestOptions} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {User} from "../entity";
import {BaseService} from "../services/base.service";


@Injectable()
export class UserService extends BaseService {
  private baseUrl = '/api/user';

  constructor(
    private _http: Http
  ){
    super();
  }

  register(user: User): Observable<any> {
    let queryUrl = this.baseUrl + '/register';
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});
    let body = JSON.stringify(user);
    return this._http.post(queryUrl, body, options)
      .map(res => res.json())
      .catch(this.handleError);
  }

  resetPassword(user: User): Observable<any> {
    let queryUrl = this.baseUrl + '/reset_pass';
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});
    let body = JSON.stringify(user);
    return this._http.post(queryUrl, body, options)
      .map(res => res.json())
      .catch(this.handleError);
  }

  login(user: User): Observable<any> {
    let queryUrl = this.baseUrl + '/login';
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});
    let body = JSON.stringify(user);
    return this._http.post(queryUrl, body, options)
      .map(res => res.json())
      .catch(this.handleError);
  }

  getUserInfo(): Observable<User> {
    let queryUrl = this.baseUrl + '/info';
    return this._http.get(queryUrl)
      .map(res =>  <User> res.json().data)
      .catch(this.handleError);
  }

}
