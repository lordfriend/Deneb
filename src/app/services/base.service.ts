import {AuthError} from '../error';
import {Observable} from "rxjs/Observable";
import {ServerError} from "../error/ServerError";

export abstract class BaseService {

  handleError(resp: any) {
    var error: Error;
    if(resp.status === 400) {
      error = new AuthError(resp.json().message, resp.status);
    } else if(resp.status == 403) {
      error = new AuthError(resp.json().message, resp.status);
    } else if(resp.status === 500) {
      error = new ServerError(resp.json().message, resp.status);
    } else if(resp.status === 502) {
      error = new ServerError('Server offline', resp.status);
    } else {
      error = new ServerError('Network Error', 0);
    }
    return Observable.throw(error);
  }

}
