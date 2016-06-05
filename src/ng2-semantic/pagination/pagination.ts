import {Component, Input, Output} from '@angular/core';
import {Observable} from "rxjs/Rx";


@Component({
  selector: 'ui-pagination',
  template: `
    <div class="ui pagination menu">
      <a class="item" *ngFor="let pageNumber of pageNumberList" [ngClass]="{disabled: pageNumber === '...'}" (click)="onClickPage(pageNumber)">
        {{pageNumber}}
      </a>
    </div>
`
})
export class UIPagination {

  pageNumberList: string[] = [];

  private _currentPageNumber: number;
  private _total: number;
  private _countPerPage: number;
  private _max: number;

  @Input()
  set currentPage(page: number) {
    this._currentPageNumber = page;
  }

  @Input()
  set total(total: number) {
    this._total = total;
  }

  @Input()
  set countPerPage(count: number) {
    this._countPerPage = count;
  }

  @Input()
  set max(max: number) {
    this._max = max;
  }

  onClickPage(pageNumber: string) {
    if(pageNumber === '...') {
      return;
    }
    let page = parseInt(pageNumber);
    if(page !== this.currentPage) {
      this.currentPage = page;
    }
  }

  private updatePageNumberList() {
    let pageIndicatorCount = Math.ceil(this._total / this._countPerPage);
    let pageNumberList: string[] = [];
    if(pageIndicatorCount > this._max) {
      
    } else {
      for(let i = 1; i <= pageIndicatorCount; i++) {
        pageNumberList.push(i + '');
      }
    }
  }
}
