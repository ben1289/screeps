import Creep from './creep';

export default class Harvester extends Creep {
  public constructor(room: Room, maximum?: number) {
    super(room, 'harvester', undefined, maximum);
  }

  public run(): void {
    for (const harvester of this.creeps) {
      const source = Game.getObjectById('5bbcae0a9099fc012e638590' as Id<_HasId>) as Source;
      if (harvester.store.getFreeCapacity() > 0) {
        // 装载量有空余 前去挖矿
        if (harvester.harvest(source) === ERR_NOT_IN_RANGE) {
          harvester.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      } else {
        // 装载量满了 前去卸矿
        const targets = harvester.room.find(FIND_STRUCTURES, {
          filter: (structure: StructureSpawn | StructureExtension) =>
            [STRUCTURE_SPAWN, STRUCTURE_EXTENSION].includes(structure.structureType) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
        if (targets.length > 0) {
          // 有能存矿的建筑 前去存矿
          if (harvester.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            harvester.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
          }
        } else {
          // 没有能存矿的建筑 前去首个 spawn 处等待
          harvester.moveTo(this.spawns[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    }
  }
}
