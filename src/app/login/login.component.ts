import {Component, OnInit} from 'angular2/core';
import {UserService} from "../user-service";
import {FormBuilder, ControlGroup, Validators} from "angular2/common";
import {User} from "../entity";

@Component({
  selector: 'login',
  template: require('./login.html'),
  providers: [UserService]
})
export class Login implements OnInit {

  loginForm: ControlGroup;

  user: User;

  constructor(private _userService:UserService,
              private _formBuilder: FormBuilder) {
    this.user = new User();
  }

  ngOnInit():any {
    this.loginForm = this._formBuilder.group({
      name: ['', Validators.required],
      password: ['', Validators.required]
    });

    return null;
  }

  login(): void {
    this._userService.login(this.user)
      .subscribe(
        res => console.log(res),
        error => console.log(error)
      )
  }
}
