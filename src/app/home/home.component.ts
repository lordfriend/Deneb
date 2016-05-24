import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {RouteConfig} from "@angular/router-deprecated";
import {DefaultComponent} from "./default/default.component";
import {HomeService} from './home.service';


@Component({
  selector: 'home',
  template: require('./home.html'),
  providers: [Title, HomeService]
})
@RouteConfig([
  {path: '/', name: 'Default', component: DefaultComponent, useAsDefault: true}
])
export class Home implements OnInit {

  siteTitle:string = SITE_TITLE;

  constructor(
    titleService: Title
  ) {
    titleService.setTitle(this.siteTitle);
  }

  ngOnInit():any {
    return null;
  }
}
