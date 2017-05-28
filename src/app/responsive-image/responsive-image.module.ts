import { NgModule } from '@angular/core';
import { ResponsiveImage } from './responsive-image.directive';
import { ResponsiveService } from './responsive.service';
import { ResponsiveImageWrapper } from './responsive-image-wrapper';

@NgModule({
    declarations: [ResponsiveImage, ResponsiveImageWrapper],
    providers: [ResponsiveService],
    exports: [ResponsiveImage, ResponsiveImageWrapper]
})
export class ResponsiveImageModule {

}
