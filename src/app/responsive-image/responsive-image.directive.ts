import { Directive, ElementRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { ResponsiveService } from './responsive.service';

export interface ResponsiveDimension {
    width: string; // px, rem, em, vw, %, auto
    height: string; // px, rem, em, vh, %, auto
}

@Directive({
    selector: 'img[responsive]'
})
export class ResponsiveImage implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    private _src: string;

    constructor(private _element: ElementRef, private _responsiveService: ResponsiveService) {
        console.log('responsive image: #' + (Math.random() * 1000));
        console.log(this._element.nativeElement.style.width);
    }

    @Input()
    set responsive(url: string) {
        this._src = url;
        console.log(url);
    }

    @HostBinding() get src(): string {
        return this._src;
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
    }
}
