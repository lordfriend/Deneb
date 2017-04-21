import {NgModule} from '@angular/core';
import {UserLevelNamePipe} from './user-level-name.pipe';
import {WeekdayPipe} from './weekday.pipe';

export const PIPES = [
    UserLevelNamePipe,
    WeekdayPipe
];

@NgModule({
    declarations: PIPES,
    exports: PIPES
})
export class DenebCommonPipes {

}
