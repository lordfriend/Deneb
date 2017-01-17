import {Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit, OnDestroy} from '@angular/core';
import {Bangumi} from '../../../entity/bangumi';
import {FeedService} from './feed.service';
import {closest} from '../../../../helpers/dom';

require('./keyword-builder.less');

@Component({
  selector: 'keyword-builder',
  template: require('./keyword-builder.html'),
  providers: [FeedService]
})
export class KeywordBuilder implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  isEditorOpen: boolean;

  @Input() bangumi: Bangumi;
  @Input() siteName: string;

  itemList: {title: string, eps_no: number}[];

  availableTable = ['yyets', 'tokyo', 'dmhy'];

  private _libykCriteria: {t: string, q: string};

  set libykCriteria(obj: {t: string, q: string}) {
    this._libykCriteria = obj;
    if (obj) {
      try {
        this.bangumi.libyk_so = JSON.stringify(this._libykCriteria);
      } catch(error) {
        console.log(error);
        this.bangumi.libyk_so = undefined;
      }
    } else {
      this.bangumi.libyk_so = undefined;
    }
  }

  get libykCriteria(): {t: string, q: string} {
    return this._libykCriteria;
  }

  outerClickHandler: (event: MouseEvent) => {};

  constructor(private feedService: FeedService) {
    this.outerClickHandler = this.outerClick.bind(this);
  }


  ngOnInit(): any {
    this.isEditorOpen = Boolean(this.bangumi[this.siteName]);
  }

  ngOnDestroy(): any {
    document.body.removeEventListener('click', this.outerClickHandler);
  }

  ngOnChanges(changes: SimpleChanges): any {
    if (changes['bangumi']) {
      this.isEditorOpen = Boolean(this.bangumi[this.siteName]);
      if (this.isEditorOpen && this.siteName === 'libyk_so') {
        try {
          this.libykCriteria = JSON.parse(this.bangumi[this.siteName]);
        } catch (error) {
          console.log(error);
          this.libykCriteria = undefined;
        }
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
    this.libykCriteria = {
      t: 'yyets',
      q: undefined
    };
  }

  removeKeyword() {
    this.bangumi[this.siteName] = undefined;
    this.libykCriteria = undefined;
    this.isEditorOpen = false;
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
