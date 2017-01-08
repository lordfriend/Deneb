import {Component, Input, Output, EventEmitter} from '@angular/core';


interface PageNumber {
  number: number,
  text: string,
  active: boolean
}

@Component({
  selector: 'ui-pagination',
  template: `
    <div class="ui pagination menu">
      <a class="item" *ngFor="let page of pageNumberList" [ngClass]="{disabled: page === '...', active: page === currentPage}" (click)="onClickPage(page)">
        {{page.text}}
      </a>
    </div>
`
})
export class UIPagination {

  _currentPageNumber: number;
  private _total: number;
  private _countPerPage: number;
  private _max: number = Number.MAX_SAFE_INTEGER;

  pageNumberList: PageNumber[] = [];

  @Output()
  pageChange = new EventEmitter<number>();

  @Input()
  set currentPage(page: number) {
    if(page !== this._currentPageNumber) {
      this._currentPageNumber = page;
      this.pageNumberList = this.updatePageNumberList();
    }
  }

  get currentPage(): number {
    return this._currentPageNumber;
  }

  @Input()
  set total(total: number) {
    this._total = total;
    if(!this.isUndefined(this._total) && !this.isUndefined(this._currentPageNumber) && !this.isUndefined(this._countPerPage)) {
      this.pageNumberList = this.updatePageNumberList();
    }
  }

  @Input()
  set countPerPage(count: number) {
    this._countPerPage = count;
    this.pageNumberList = this.updatePageNumberList();
  }

  @Input()
  set max(max: number) {
    this._max = max;
  }

  onClickPage(page: PageNumber) {
    if(page.text === '...') {
      return;
    }
    if(page.number !== this._currentPageNumber) {
      this.currentPage = page.number;
      this.pageChange.emit(page.number);
    }
  }

  private isUndefined(obj: any) {
    return typeof obj === 'undefined';
  }

  private makePage(number: number, text: string, isActive: boolean): PageNumber {
    return {
      number: number,
      text: text,
      active: isActive
    }
  }

  private updatePageNumberList(): PageNumber[] {
    console.log('rebuild pages');
    let totalPages = Math.ceil(this._total / this._countPerPage);
    let pages: PageNumber [] = [];
    let startPage = 1, endPage = totalPages;
    if(totalPages > this._max) {
      // Visible pages are paginated with maxSize
      startPage = (Math.ceil(this._currentPageNumber / this._max) - 1) * this._max + 1;
      // Adjust last page if limit is exceeded
      endPage = Math.min(startPage + this._max - 1, totalPages);
    }
    for(let i = startPage; i <= endPage; i++) {
      pages.push(this.makePage(i, i + '', i === this._currentPageNumber));
    }

    if(totalPages > this._max) {
      if(startPage > 1) {
        if(startPage > 3) {
          let previousPageSet = this.makePage(startPage - 1, '...', false);
          pages.unshift(previousPageSet);
        }
        if(startPage === 3) {
          let secondPageLink = this.makePage(2, '2', false);
          pages.unshift(secondPageLink);
        }

        var firstPageLink = this.makePage(1, '1', false);
        pages.unshift(firstPageLink);
      }

      if(endPage < totalPages) {
        if(endPage < totalPages - 2) {
          let nextPageSet = this.makePage(endPage + 1, '...', false);
          pages.push(nextPageSet);
        }
        if(endPage === totalPages -2) {
          let secondToLastPageLink = this.makePage(totalPages -1 , (totalPages -1) + '', false);
          pages.push(secondToLastPageLink);
        }
        let lastPageList = this.makePage(totalPages, totalPages + '', false);
        pages.push(lastPageList);
      }
    }
    return pages;
  }
}

export var PAGINATION_DIRECTIVES = [UIPagination];
