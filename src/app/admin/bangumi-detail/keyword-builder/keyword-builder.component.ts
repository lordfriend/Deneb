import {Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit, OnDestroy} from '@angular/core';
import {Bangumi} from '../../../entity/bangumi';
import {FeedService} from './feed.service';
import {closest} from '../../../../facade/lang';

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
      console.log(changes);
      this.isEditorOpen = Boolean(this.bangumi[this.siteName]);
    }
  }

  ngAfterViewInit(): any {
    document.body.addEventListener('click', this.outerClickHandler, true);
  }

  outerClick(event: MouseEvent) {
    let target = event.target;
    console.log(closest(target, '.search-result-wrapper'));
    if (this.itemList && this.itemList.length > 0 && closest(target, '.search-result-wrapper') === null) {
      this.itemList = [];
      event.preventDefault();
      event.stopPropagation();
    }
  }

  addKeyword() {
    this.isEditorOpen = true;
  }

  removeKeyword() {
    this.bangumi[this.siteName] = undefined;
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
    }
  }
}
