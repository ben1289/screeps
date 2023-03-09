import * as roomStore from './roomStore';

let loadedTick = 0;

const my: Map<Room['name'], StructureTower[]> = new Map();

function init(tick = 10): void {
  if (Game.time - loadedTick < tick) return;
  for (const room of roomStore.my) {
    my.set(room.name, room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }));
  }
  loadedTick = Game.time;
}

export { my, init };
