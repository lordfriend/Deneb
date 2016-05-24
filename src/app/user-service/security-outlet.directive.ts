import {
  Directive,
  Attribute,
  DynamicComponentLoader,
  ComponentRef,
  ViewContainerRef,
  provide,
  ReflectiveInjector,
  OnDestroy,
  Output
} from '@angular/core';
import {Router, RouterOutlet, ComponentInstruction} from '@angular/router-deprecated';
import {Authentication} from "./authentication.service";
import {User} from "../entity/user";
import {AuthError} from "../error/AuthError";

@Directive({
  selector: 'security-outlet'
})
export class SecurityOutlet extends RouterOutlet {

  private _authentication: Authentication;
  private parentRouter: Router;

  private loginAttr: string;
  private unauthorized: string;

  constructor(viewContainerRef: ViewContainerRef,
              loader: DynamicComponentLoader,
              parentRouter: Router,
              @Attribute('name') nameAttr: string,
              @Attribute('login') loginAttr: string,
              @Attribute('unauthorized') unathorized: string,
              authentication: Authentication) {

    super(viewContainerRef, loader, parentRouter, nameAttr);

    this._authentication = authentication;
    this.parentRouter = parentRouter;
    this.loginAttr = loginAttr;
    this.unauthorized = unathorized;
  }


  activate(nextInstruction:ComponentInstruction):Promise<any> {
    var requiredLevel = 0;
    var extraData = nextInstruction.routeData.data;
    // if no level is defined on this route, use super class default method
    if(!extraData || !extraData['level']) {
      return super.activate(nextInstruction);
    }

    requiredLevel = extraData['level'];

    return this._authentication.isAuthenticated()
      .then((user: User) => {
        var ins;
        if(user.level >= requiredLevel) {
          // use level is higher or equal required level. then the route can be activated.
          return super.activate(nextInstruction);
        } else {
          // user has insufficient level, redirect to error page
          ins = this.parentRouter.generate([this.unauthorized, {message: AuthError.PERMISSION_DENIED, status: 403}]);
          return super.activate(ins.component);
        }
      }, (error: any) => {
        var ins;
        if(error instanceof AuthError) {
          // login error redirect to login page
          ins = this.parentRouter.generate([this.loginAttr, {url: this.parentRouter.lastNavigationAttempt}]);
          return super.activate(ins.component);
        } else {
          // other error occurs, redirect to error page
          ins = this.parentRouter.generate([this.unauthorized, {message: error.message, status: error.status}]);
          return super.activate(ins.component);
        }
      })
  }
}
