import { Injectable } from '@angular/core';

export interface ObservableStub {
    target: Element;
    callback(rect: ClientRect): void;
    unobserveOnVisible: boolean;
}

@Injectable()
export class ResponsiveService {
    private _observer: IntersectionObserver;

    private _observableStubList: ObservableStub[] = [];

    constructor() {
        this._observer = new IntersectionObserver(this.intersectionCallback.bind(this));
    }

    intersectionCallback(entries: IntersectionObserverEntry[]) {
        entries.filter(entry => {
            return entry['isIntersecting']; // current lib.es6.d.ts not updated.
        }).forEach((entry: IntersectionObserverEntry) => {
            let stub = this.getStub(entry.target);
            if (stub) {
                stub.callback(entry.boundingClientRect);
                if (stub.unobserveOnVisible) {
                    this.unobserve(stub);
                }
            }
        });
    }

    observe(stub: ObservableStub) {
        if (this.getStub(stub.target)) {
            throw new Error('Duplicate ObservableStub on target');
        }
        this._observableStubList.push(stub);
        this._observer.observe(stub.target);
    }

    unobserve(stub: ObservableStub) {
        let index = this._observableStubList.findIndex(obStub => obStub == stub);
        if (index !== -1) {
            this._observableStubList.splice(index, 1);
            this._observer.unobserve(stub.target);
        }
    }

    private getStub(target: Element) {
        if (!this._observableStubList) {
            return null;
        }
        return this._observableStubList.find(stub => stub.target === target);
    }
}
