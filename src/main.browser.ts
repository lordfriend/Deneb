/*
 * Providers provided by Angular
 */
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';


/*
* App Component
* our top level component that holds all of our components
*/
import {AppModule} from './app';

/*
 * Bootstrap our Angular app with a top level NgModule
 */
platformBrowserDynamic().bootstrapModule(AppModule);
