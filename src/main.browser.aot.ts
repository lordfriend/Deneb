import { enableProdMode } from '@angular/core';
/*
 * Providers provided by Angular
 */
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app';
import './assets/semantic-ui';

enableProdMode();

/*
 * Bootstrap our Angular app with a top level NgModule
 */
export function main(): Promise<any> {
  return platformBrowser()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
}

export function bootstrapDomReady() {
  document.addEventListener('DOMContentLoaded', main);
}

bootstrapDomReady();
