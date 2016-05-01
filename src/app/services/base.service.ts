import {AuthError} from '../error';
import {Observable} from "rxjs/Observable";

export abstract class BaseService {

  handleError(resp: any) {
    var error: Error;
    if(resp.status === 400) {
      error = new AuthError(resp.json().message, resp.status);
    } else if(resp.status == 403) {
      error = new AuthError(resp.json().message, resp.status);
    } else if(resp.status === 500) {
      error = new AuthError(resp.json().message, resp.status);
    }
    return Observable.throw(error);
  }

}
