
import {throwError as observableThrowError, Observable} from 'rxjs';
import {AuthError} from './error';
import {ServerError} from './error/ServerError';
import {ClientError} from './error/ClientError';

export abstract class BaseService {

    handleError(resp: any) {
        var error: Error;
        if (resp.status === 400) {
            if (resp.json().message === AuthError.LOGIN_FAIL) {
                error = new AuthError(resp.message, resp.status);
            } else {
                error = new ClientError(resp.message, resp.status);
            }
        } else if (resp.status === 401) {
            error = new AuthError(resp.message, resp.status);
        } else if (resp.status == 403) {
            error = new AuthError(resp.message, resp.status);
        } else if (resp.status === 500) {
            error = new ServerError(resp.message, resp.status);
        } else if (resp.status === 502) {
            error = new ServerError('Server offline', resp.status);
        } else {
            error = new ServerError('Network Error', 0);
        }
        return observableThrowError(error);
    }

}
