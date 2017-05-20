import { NgModule } from '@angular/core';
import { AlertDialog } from './alert-dialog.component';
import { UIDialogModule } from 'deneb-ui';
@NgModule({
    declarations: [AlertDialog],
    imports: [UIDialogModule],
    exports: [AlertDialog],
    entryComponents: [AlertDialog]
})
export class AlertDialogModule {

}
