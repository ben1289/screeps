import Creep from './creep';

/**
 * 采集者
 */
export default class Harvester extends Creep {
  public constructor(room: Room, maximum?: number) {
    super(room, 'harvester', undefined, maximum);
  }

  public run(): void {
    for (const harvester of this.creeps) {
      if (this.renewTick(harvester)) return;
      const source = Game.getObjectById('5bbcae0a9099fc012e638590' as Id<_HasId>) as Source;
      if (harvester.store.getFreeCapacity() > 0) {
        // 装载量有空余 前去挖矿
        if (harvester.harvest(source) === ERR_NOT_IN_RANGE) {
          harvester.moveTo(source, { visualizePathStyle: { stroke: '#ffff00' } });
        }
      } else {
        // 装载量满了 前去卸矿
        let targets = harvester.room.find(FIND_STRUCTURES, {
          filter: (structure: StructureSpawn | StructureExtension) =>
            [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER, STRUCTURE_TOWER].includes(
              structure.structureType
            ) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
        // 将扩展的优先级提高
        const extension = targets.filter(structure => structure.structureType === STRUCTURE_EXTENSION);
        targets = extension.length > 0 ? extension : targets;

        if (targets.length > 0) {
          // 有能存矿的建筑 前去存矿
          if (harvester.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            harvester.moveTo(targets[0], { visualizePathStyle: { stroke: '#00d9ff' } });
          }
        } else {
          // 没有能存矿的建筑 前去首个 spawn 处等待
          harvester.moveTo(this.spawns[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    }
  }
}
