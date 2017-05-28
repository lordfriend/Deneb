import { Component, Input } from '@angular/core';
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
                    (load)="onLoad()"
                    (error)="onError()">`,
    styles: [`
        :host {
            box-sizing: border-box;
            position: relative;
        }

        .responsive-image {
            display: block;
            object-fit: cover;
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
                    height: `${widthInPixel * s.ratio}px`
                };
            } else {
                dimen = {
                    width: '100%',
                    height: 'auto'
                }
            }
        } else {
            this.hostWidth = s.width;
            this.hostHeight = s.height;
            dimen = {
                width: 'auto',
                height: 'auto',
            };
            if (s.width === 'auto') {
                this.imageWidth = 'auto';
            } else {
                this.imageWidth = '100%';
                let widthInPixel = ResponsiveImage.getPx(s.width);
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
                let heightInPixel = ResponsiveImage.getPx(s.height);
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

    onLoad() {
        this.imageOpacity = 1;
    }

    onError() {
        this.imageOpacity = DEFAULT_HIDDEN_OPACITY;
    }
}
