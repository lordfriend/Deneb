import {INPUT_DIRECTIVES} from './input/input';
import {DIMMER_DIRECTIVES} from './dimmer/dimmer';
import {UI_IMAGE_PLACE_HOLDER_DIRECTIVES} from "./image-placeholder/image-placeholder";

require('./ng2-semantic.less');

export var UI_DIRECTIVES = [
  ...INPUT_DIRECTIVES,
  ...DIMMER_DIRECTIVES,
  ...UI_IMAGE_PLACE_HOLDER_DIRECTIVES
];