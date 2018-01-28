import { NgModule } from '@angular/core';
import { ChromeExtensionService } from './chrome-extension.service';
import { BangumiAuthDialogComponent } from './bangumi-auth-dialog/bangumi-auth-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UIDialogModule } from 'deneb-ui';

@NgModule({
    declarations: [BangumiAuthDialogComponent],
    providers: [ChromeExtensionService],
    imports: [ReactiveFormsModule, UIDialogModule],
    entryComponents: [BangumiAuthDialogComponent]
})
export class BrowserExtensionModule {

}
