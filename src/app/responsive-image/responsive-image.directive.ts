import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

@Directive({
    selector: 'img[src]'
})
export class ResponsiveImage implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    private _src: string;

    constructor(private _element: ElementRef) {
        console.log('responsive image: #' + (Math.random() * 1000));
        console.log(this._element.nativeElement.style.width);
    }
    @Input()
    set src(url: string) {
        this._src = url;
        console.log(url);
    }

    get src(): string {
        return this._src;
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
    }
}
