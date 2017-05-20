import { NgModule } from '@angular/core';
import { ResetPass } from './reset-pass.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [ResetPass],
    imports: [ReactiveFormsModule, CommonModule]
})
export class ResetPassModule {

}
