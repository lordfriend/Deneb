import {Component, Input, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {Bangumi} from '../../../entity/bangumi';
import {FeedService} from './feed.service';

require('./keyword-builder.less');

@Component({
  selector: 'keyword-builder',
  template: require('./keyword-builder.html'),
  providers: [FeedService]
})
export class KeywordBuilder implements OnInit, OnChanges {
  isEditorOpen: boolean;

  @Input() bangumi: Bangumi;
  @Input() siteName: string;

  itemList: {title: string, eps_no: number}[];

  constructor(private feedService: FeedService) {
  }


  ngOnInit(): any {
    this.isEditorOpen = Boolean(this.bangumi[this.siteName]);
  }

  ngOnChanges(changes: SimpleChanges): any {
    if(changes['bangumi']) {
      console.log(changes);
      this.isEditorOpen = Boolean(this.bangumi[this.siteName]);
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
    if(this.siteName === 'dmhy') {
      this.feedService.queryDmhy(keyword)
        .subscribe((result) => {
          this.itemList = result;
        }, () => {});
    } else if (this.siteName === 'acg_rip') {
      this.feedService.queryAcgrip(keyword)
        .subscribe((result) => {
          this.itemList = result;
        }, () => {});
    }
  }
}
