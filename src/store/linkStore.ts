import * as roomStore from './roomStore';
import { mapArrValAdd } from '../utils';

let loadedTick = 0;

const nearSource: Map<Source['id'], StructureLink[]> = new Map();
const other: Map<Room['name'], StructureLink[]> = new Map();

function init(tick = 10): void {
  if (Game.time - loadedTick < tick) return;
  for (const room of roomStore.my) {
    const links: StructureLink[] = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } });
    for (const link of links) {
      const sources = link.pos.findInRange(FIND_SOURCES, 1);
      for (const source of sources) {
        mapArrValAdd(nearSource, source.id, link);
      }
      if (sources.length === 0) {
        mapArrValAdd(other, room.name, link);
      }
    }
  }
  loadedTick = Game.time;
}

export { nearSource, other, init };
