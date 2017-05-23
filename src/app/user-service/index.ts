import { NgModule } from '@angular/core';
import { UserService } from './user.service';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { Authentication } from './authentication.service';

@NgModule({
    providers: [UserService, Authentication],
    imports: [HttpModule, RouterModule]
})
export class UserServiceModule {

}

export * from './user.service';
export * from './authentication.service';
