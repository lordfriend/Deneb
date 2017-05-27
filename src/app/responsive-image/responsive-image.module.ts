import { NgModule } from '@angular/core';
import { ResponsiveImage } from './responsive-image.directive';
import { ResponsiveService } from './responsive.service';

@NgModule({
    declarations: [ResponsiveImage],
    providers: [ResponsiveService],
    exports: [ResponsiveImage]
})
export class ResponsiveImageModule {

}
