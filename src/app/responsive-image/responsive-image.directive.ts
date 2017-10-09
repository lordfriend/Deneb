import {
    ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnChanges, OnDestroy,
    OnInit, Output, SimpleChanges
} from '@angular/core';
import { ObservableStub, ResponsiveService } from './responsive.service';
import { getRemPixel, getVhInPixel, getVwInPixel } from '../../helpers/dom';

export interface ResponsiveDimension {
    width: string; // px, rem, vw, auto, 100%
    height: string; // px, rem, vh, auto, 100%
    originalWidth: number;
    originalHeight: number;
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
export class ResponsiveImage implements OnInit, OnChanges, OnDestroy {
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

    @Output()
    imageLoad = new EventEmitter<Event>();

    @Output()
    imageError = new EventEmitter<Event>();

    observableStub: ObservableStub;

    constructor(private _element: ElementRef,
                private _responsiveService: ResponsiveService,
                private _changeDetector: ChangeDetectorRef) {
    }

    @HostListener('load', ['$event'])
    onLoad(event: Event) {
        if (this._respSrc) {
            this.imageLoad.emit(event);
        }
    }

    @HostListener('error', ['$event'])
    onError(event: Event) {
        if (this._respSrc) {
            this.imageError.emit(event);
        }
    }

    ngOnInit(): void {
        this.dimensionChange(this.dimension);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('dimension' in changes && !changes['dimension'].firstChange) {
            const dimension = changes['dimension'].currentValue as ResponsiveDimension;
            this.dimensionChange(dimension);
        }
    }

    ngOnDestroy(): void {
        if (this.observableStub) {
            this._responsiveService.unobserve(this.observableStub);
        }
    }

    private dimensionChange(dimension: ResponsiveDimension) {
        const width = dimension.width;
        const height = dimension.height;
        if (!dimension ||
            width === '100%' || height === '100%') {
            this.needMeasure();
            return;
        }
        if (width !== 'auto') {
            this._width = Math.round(ResponsiveImage.getPx(width));
        } else {
            this._width = 0;
        }
        if (height !== 'auto') {
            this._height = Math.round(ResponsiveImage.getPx(height));
        } else {
            this._height = 0;
        }
        this.makeRespSrc(false);
    }

    private needMeasure() {
        if (this.observableStub) {
            this._responsiveService.unobserve(this.observableStub);
        }
        this.observableStub = {
            target: this._element.nativeElement,
            callback: (rect: ClientRect) => {
                if (!this.dimension || this.dimension.width !== 'auto') {
                    if (rect.width)
                    this._width = Math.min(this.dimension.originalWidth, Math.round(rect.width));
                } else {
                    this._width = 0;
                }
                if (!this.dimension || this.dimension.height !== 'auto') {
                    this._height = Math.min(this.dimension.originalHeight, Math.round(rect.height));
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
            if (/^(?:data:).+/.test(this._src)) {
                this._respSrc = this._src;
            } else {
                let width = this._width;
                let height = this._height;
                if (this._width !== 0 && this._height !== 0
                    && Number.isFinite(this.dimension.originalWidth)
                    && Number.isFinite(this.dimension.originalHeight)) {
                    let ratio = this._height / this._width;
                    let originalRatio = this.dimension.originalHeight / this.dimension.originalWidth;
                    if (originalRatio > ratio) {
                        width = this._width;
                        height = 0;
                    } else if (originalRatio < ratio) {
                        width = 0;
                        height = this._height;
                    }  else {
                        width = this._width;
                        height = this._height;
                    }
                }
                this._respSrc = `${this._src}?size=${width}x${height}`;
            }
            if (manualChangeDetection) {
                this._changeDetector.detectChanges();
            }
        }
    }
}
