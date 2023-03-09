import * as roomStore from './roomStore';

let myRoomNum = 0;
let otherRoomNum = 0;

const my: Map<Room['name'], Source[]> = new Map();
const other: Map<Room['name'], Source[]> = new Map();
const harvesting: Set<Source['id']> = new Set();

function init(): void {
  if (myRoomNum !== roomStore.my.length) {
    for (const room of roomStore.my) {
      my.set(room.name, room.find(FIND_SOURCES));
    }
    myRoomNum = roomStore.my.length;
  }
  if (otherRoomNum !== roomStore.other.length) {
    for (const room of roomStore.other) {
      other.set(room.name, room.find(FIND_SOURCES));
    }
    otherRoomNum = roomStore.other.length;
  }
}

export { my, other, harvesting, init };
