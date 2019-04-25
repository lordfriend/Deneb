import { NgModule } from '@angular/core';
import { ChromeExtensionService } from './chrome-extension.service';
import { ExtensionRpcService } from './extension-rpc.service';

@NgModule({
    providers: [ExtensionRpcService, ChromeExtensionService]
})
export class BrowserExtensionModule {

}
