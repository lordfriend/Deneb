import {
    ChangeDetectorRef, Directive, ElementRef, HostBinding, Input, OnDestroy, OnInit,
    Optional
} from '@angular/core';
import { ObservableStub, ResponsiveService } from './responsive.service';
import { getRemPixel, getVhInPixel, getVwInPixel } from '../../helpers/dom';

export interface ResponsiveDimension {
    width: string; // px, rem, vw, auto, 100%
    height: string; // px, rem, vh, auto, 100%
}
/**
 * This directive will let a normal HTMLImageElement load a resized image from source url according to its current dimension.
 * It use different approach to decide the dimension depends on `dimension` property.
 * If `dimension` property is not defined or width and height are both set to auto, it will use IntersectionObserver to measure
 * the actual dimension when image is visible in viewport.
 * Otherwise, it will calculate the dimension base on width and height
 * The src will be set to {originalSrc}?size={width}x{height}
 * - originalSrc is the source url of the image
 * - width is calculated or measured width
 * - height is calculated or measured height
 */
@Directive({
    selector: 'img[originalSrc]'
})
export class ResponsiveImage implements OnInit, OnDestroy {
    private _src: string;
    private _respSrc: string;

    private _width: number;
    private _height: number;

    @Input()
    set originalSrc(url: string) {
        this._src = url;
        this.makeRespSrc(false);
    }

    @Input()
    dimension: ResponsiveDimension;

    @HostBinding() get src(): string {
        if (!this._respSrc) {
            return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=';
        }
        return this._respSrc;
    }

    observableStub: ObservableStub;

    constructor(private _element: ElementRef,
                private _responsiveService: ResponsiveService,
                private _changeDetector: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        if (!this.dimension ||
            this.dimension.width === '100%' || this.dimension.height === '100%') {
            this.needMeasure();
            return;
        }
        let width = this.dimension.width;
        let height = this.dimension.height;
        if (width !== 'auto') {
            this._width = ResponsiveImage.getPx(width);
        } else {
            this._width = 0;
        }
        if (height !== 'auto') {
            this._height = ResponsiveImage.getPx(height);
        } else {
            this._height = 0;
        }
        this.makeRespSrc(false);
    }

    ngOnDestroy(): void {
        if (this.observableStub) {
            this._responsiveService.unobserve(this.observableStub);
        }
    }

    private needMeasure() {
        this.observableStub = {
            target: this._element.nativeElement,
            callback: (rect: ClientRect) => {
                if (!this.dimension || this.dimension.width !== 'auto') {
                    this._width = rect.width;
                } else {
                    this._width = 0;
                }
                if (!this.dimension || this.dimension.height !== 'auto') {
                    this._height = rect.height;
                } else {
                    this._height = 0;
                }
                this.makeRespSrc(true);
            },
            unobserveOnVisible: true
        };
        this._responsiveService.observe(this.observableStub);
    }

    static getPx(dimen: string): number {
        let match = dimen.match(/(\d*(?:.\d+)?)(px|rem|em|vw|vh)$/);
        if (!match) {
            return 0;
        }
        let value = parseInt(match[1]);
        let unit = match[2];
        switch (unit) {
            case 'rem':
                return getRemPixel(value);
            case 'vw':
                return getVwInPixel(value);
            case 'vh':
                return getVhInPixel(value);
            default:
                return value;
        }
    }

    private makeRespSrc(manualChangeDetection: boolean) {
        if (typeof this._width !== 'undefined' && typeof this._height !== 'undefined' && this._src) {
            this._respSrc = `${this._src}?size=${this._width}x${this._height}`;
            if (manualChangeDetection) {
                this._changeDetector.detectChanges();
            }
        }
    }
}
