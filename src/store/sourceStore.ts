import { myRooms } from './roomStore';
import { containersNearSource, otherContainers } from './containerStore';
import { linksNearSource, otherLinks } from './linkStore';

let loaded = false;
let loadedTick = 0;
export const mySource: Map<string, Source[]> = new Map();

export function initSourceStore(): void {
  if (loaded) return;
  for (const room of myRooms) {
    mySource.set(room.name, room.find(FIND_SOURCES));
  }
  loaded = true;
}

export function initContBySrc(tick = 10): void {
  if (Game.time - loadedTick < tick) return;
  for (const room of myRooms) {
    const sources = mySource.get(room.name) ?? [];
    const containers: StructureContainer[] = room.find(FIND_STRUCTURES, {
      filter: { structureType: STRUCTURE_CONTAINER }
    });
    const links: StructureLink[] = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } });
    for (const source of sources) {
      // 获取 source 附近的建筑
      const nearStructures = source.pos.findInRange(FIND_STRUCTURES, 1);
      const nearStructureIds = nearStructures.map(nearStructure => nearStructure.id);

      for (const container of containers) {
        if (nearStructureIds.indexOf(container.id) !== -1) {
          if (!containersNearSource.has(source.id)) {
            containersNearSource.set(source.id, []);
          }
          containersNearSource.get(source.id)?.push(container);
        } else {
          if (!otherContainers.has(room.name)) {
            otherContainers.set(room.name, []);
          }
          otherContainers.get(room.name)?.push(container);
        }
      }

      for (const link of links) {
        if (nearStructureIds.indexOf(link.id) !== -1) {
          if (!linksNearSource.has(source.id)) {
            linksNearSource.set(source.id, []);
          }
          linksNearSource.get(source.id)?.push(link);
        } else {
          if (!otherLinks.has(source.id)) {
            otherLinks.set(room.name, []);
          }
          otherLinks.get(room.name)?.push(link);
        }
      }
    }
  }
  loadedTick = Game.time;
}
