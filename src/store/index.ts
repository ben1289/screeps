import * as roomStore from './roomStore';
import * as sourceStore from './sourceStore';
import * as containerStore from './containerStore';
import * as linkStore from './linkStore';
import * as towerStore from './towerStore';

function initStore(): void {
  roomStore.init();
  sourceStore.init();
  containerStore.init();
  linkStore.init();
  towerStore.init();
}

export { initStore, roomStore, sourceStore, containerStore, linkStore, towerStore };
