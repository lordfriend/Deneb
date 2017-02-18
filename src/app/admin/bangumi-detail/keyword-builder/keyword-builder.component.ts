import {Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit, OnDestroy, EventEmitter} from '@angular/core';
import {Subscription} from 'rxjs';
import {Bangumi} from '../../../entity/bangumi';
import {FeedService} from './feed.service';
import {closest} from '../../../../helpers/dom';

require('./keyword-builder.less');

@Component({
  selector: 'keyword-builder',
  templateUrl: './keyword-builder.html',
  providers: [FeedService]
})
export class KeywordBuilder implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  isEditorOpen: boolean;

  @Input() bangumi: Bangumi;
  @Input() siteName: string;

  itemList: {title: string, eps_no: number}[];

  availableTable = ['yyets', 'tokyo', 'dmhy'];

  libykCriteria: LibykCriteria;

  libykCriteriaSubscription: Subscription;

  outerClickHandler: (event: MouseEvent) => {};

  constructor(private feedService: FeedService) {
    this.outerClickHandler = this.outerClick.bind(this);
  }


  ngOnInit(): any {
    this.isEditorOpen = Boolean(this.bangumi[this.siteName]);
  }

  ngOnDestroy(): any {
    document.body.removeEventListener('click', this.outerClickHandler);
    if (this.libykCriteriaSubscription) {
      this.libykCriteriaSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): any {
    if (changes['bangumi']) {
      this.isEditorOpen = Boolean(this.bangumi[this.siteName]);
      if (this.isEditorOpen && this.siteName === 'libyk_so') {
        this.libykCriteria = new LibykCriteria(this.bangumi[this.siteName]);
        this.libykCriteriaSubscription = this.libykCriteria.criteriaUpdate.subscribe(
          (criteria: string) => {
            this.bangumi[this.siteName] = criteria;
          }, () => {}
        );
      }
    }
  }

  ngAfterViewInit(): any {
    document.body.addEventListener('click', this.outerClickHandler, true);
  }

  outerClick(event: MouseEvent) {
    let target = event.target;
    if (this.itemList && this.itemList.length > 0 && closest(target, '.search-result-wrapper') === null) {
      this.itemList = [];
      event.preventDefault();
      event.stopPropagation();
    }
  }

  addKeyword() {
    this.isEditorOpen = true;
    this.libykCriteria = new LibykCriteria();
    this.libykCriteria.t = this.availableTable[0];
    this.libykCriteriaSubscription = this.libykCriteria.criteriaUpdate.subscribe(
          (criteria: string) => {
            this.bangumi[this.siteName] = criteria;
          }, () => {}
        );
  }

  removeKeyword() {
    this.bangumi[this.siteName] = undefined;
    this.libykCriteria = undefined;
    this.isEditorOpen = false;
    this.libykCriteriaSubscription.unsubscribe();
  }

  testFeed() {
    let keyword = this.bangumi[this.siteName];
    if (this.siteName === 'dmhy') {
      this.feedService.queryDmhy(keyword)
        .subscribe((result) => {
          this.itemList = result;
        }, () => {
        });
    } else if (this.siteName === 'acg_rip') {
      this.feedService.queryAcgrip(keyword)
        .subscribe((result) => {
          this.itemList = result;
        }, () => {
        });
    } else if (this.siteName === 'libyk_so') {
      this.feedService.queryLibyk_so(this.libykCriteria)
        .subscribe((result) => {
          this.itemList = result;
        }, () => {});
    }
  }
}

class LibykCriteria {
  private _t: string;
  private _q: string;

  criteriaUpdate: EventEmitter<string> = new EventEmitter();

  constructor(public criteria?: string) {
    if (! this.criteria) {
      return;
    }
    try {
      let obj = JSON.parse(this.criteria);
      this._t = obj.t;
      this._q = obj.q;
    } catch (error) {
      console.log(error);
      this.criteria = undefined;
    }
  }

  get t(): string {
    return this._t;
  }

  set t(table: string) {
    this._t = table;
    this._updateCriteria();
  }

  get q(): string {
    return this._q;
  }

  set q(query: string) {
    this._q = query;
    this._updateCriteria();
  }

  private _updateCriteria() {
    if (this._t && this._q) {
      try {
        this.criteria = JSON.stringify({t: this._t, q: this._q});
      } catch(error) {
        console.log(error);
        this.criteria = undefined;
      }
    } else {
      this.criteria = undefined;
    }
    this.criteriaUpdate.emit(this.criteria);
  }
}
