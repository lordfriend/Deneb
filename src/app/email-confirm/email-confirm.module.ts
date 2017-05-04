import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailConfirm } from './email-confirm.component';
import { EmailConfirmService } from "./email-confirm.service";

@NgModule({
    declarations: [EmailConfirm],
    imports: [CommonModule],
    providers: [EmailConfirmService]
})
export class EmailConfirmModule {

}
