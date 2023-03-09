import { mapArrValAdd } from '../utils';

let loadedTick = 0;

const nearSource: Map<Source['id'], StructureContainer[]> = new Map();
const other: Map<Room['name'], StructureContainer[]> = new Map();

function init(tick = 10): void {
  if (Game.time - loadedTick < tick) return;
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    const containers: StructureContainer[] = room.find(FIND_STRUCTURES, {
      filter: { structureType: STRUCTURE_CONTAINER }
    });
    for (const container of containers) {
      const sources = container.pos.findInRange(FIND_SOURCES, 1);
      for (const source of sources) {
        mapArrValAdd(nearSource, source.id, container);
      }
      if (sources.length === 0) {
        mapArrValAdd(other, roomName, container);
      }
    }
  }
  loadedTick = Game.time;
}

export { nearSource, other, init };
