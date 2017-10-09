import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResponsiveDimension, ResponsiveImage } from './responsive-image.directive';

export interface ResponsiveWrapperSize {
    /**
     * can be rem, em, pixel, %, vw, auto
     */
    width?: string;
    /**
     * can be rem, em, pixel, %, vh, auto
     */
    height?: string;
    /**
     * A value represents height / width
     * If ratio is used, width must have value and cannot be auto,
     * and height will be ignored.
     */
    ratio?: number;

    /**
     * the image original width and height in pixel
     */
    originalWidth: number;
    originalHeight: number;
}

export const DEFAULT_HIDDEN_OPACITY = 0.01;

@Component({
    selector: 'responsive-image',
    template: `<img class="responsive-image"
                    [originalSrc]="src"
                    [dimension]="dimension"
                    [style.width]="imageWidth"
                    [style.height]="imageHeight" 
                    [style.position]="imagePosition"
                    [style.opacity]="imageOpacity"
                    (imageLoad)="onLoad($event)"
                    (imageError)="onError($event)">`,
    styles: [`
        :host {
            box-sizing: border-box;
            position: relative;
        }

        .responsive-image {
            display: block;
            object-fit: cover;
            transition: opacity 500ms;
        }
    `],
    host: {
        '[style.display]': 'display',
        '[style.width]': 'hostWidth',
        '[style.height]': 'hostHeight',
        '[style.paddingBottom]': 'hostPaddingBottom',
        '[style.background]': 'background'
    }
})
export class ResponsiveImageWrapper {

    dimension: ResponsiveDimension;

    @Input()
    src: string;

    @Input()
    display: string = 'block';

    @Input()
    set size(s: ResponsiveWrapperSize) {
        let dimen: ResponsiveDimension;
        if (s.ratio) {
            this.imageWidth = '100%';
            this.imageHeight = '100%';
            this.hostWidth = s.width;
            this.hostHeight = '0';
            this.hostPaddingBottom = `${s.ratio * 100}%`;
            this.imagePosition = 'absolute';
            let widthInPixel = ResponsiveImage.getPx(s.width);
            if (widthInPixel !== 0) {
                dimen = {
                    width: `${widthInPixel}px`,
                    height: `${widthInPixel * s.ratio}px`,
                    originalWidth: s.originalWidth,
                    originalHeight: s.originalHeight
                };
            } else {
                if (s.originalHeight / s.originalWidth < s.ratio) {
                    dimen = {
                        width: 'auto',
                        height: '100%',
                        originalWidth: s.originalWidth,
                        originalHeight: s.originalHeight
                    }
                } else {
                    dimen = {
                        width: '100%',
                        height: 'auto',
                        originalWidth: s.originalWidth,
                        originalHeight: s.originalHeight
                    }
                }
            }
        } else {
            this.hostWidth = s.width;
            this.hostHeight = s.height;
            dimen = {
                width: 'auto',
                height: 'auto',
                originalWidth: s.originalWidth,
                originalHeight: s.originalHeight
            };
            if (s.width === 'auto') {
                this.imageWidth = 'auto';
            } else {
                this.imageWidth = '100%';
                let widthInPixel = Math.round(ResponsiveImage.getPx(s.width));
                if (widthInPixel !== 0) {
                    dimen.width = `${widthInPixel}px`;
                } else {
                    dimen.width = '100%';
                }
            }

            if (s.height === 'auto') {
                this.imageHeight = 'auto';
            } else {
                this.imageHeight = '100%';
                let heightInPixel = Math.round(ResponsiveImage.getPx(s.height));
                if (heightInPixel !== 0) {
                    dimen.height = `${heightInPixel}px`;
                } else {
                    dimen.height = '100%';
                }
            }
        }
        this.dimension = dimen;
    };

    @Input()
    background: string = '#cccccc'; // color

    hostWidth: string;
    hostHeight: string;
    hostPaddingBottom: string = '0';

    imageWidth: string;
    imageHeight: string;
    imagePosition: string = 'static';

    imageOpacity: number = DEFAULT_HIDDEN_OPACITY;

    @Output()
    imageLoad = new EventEmitter<Event>();

    @Output()
    imageError = new EventEmitter<Event>();

    onLoad(event: Event) {
        this.imageOpacity = 1;
        this.imageLoad.emit(event);
    }

    onError(event: Event) {
        this.imageOpacity = DEFAULT_HIDDEN_OPACITY;
        this.imageError.emit(event);
    }
}
