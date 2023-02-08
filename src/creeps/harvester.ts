import CreepBase from './creepBase';

/**
 * 采集者
 */
export default class Harvester extends CreepBase {
  public constructor(room: Room, maximum = 3) {
    super(room, 'harvester', maximum);
  }

  public run(): void {
    for (const creep of this.creeps) {
      if (this.renewTick(creep)) return;
      if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.working = false;
        creep.say('⛏️ 去挖矿');
      }
      if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = true;
        creep.say('⬇️ 去卸货');
      }
      if (creep.memory.working) {
        // 装载量满了 前去卸矿
        type StructureTypes = StructureExtension | StructureSpawn | StructureContainer | StructureTower;
        const structureTypes = [STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_CONTAINER, STRUCTURE_TOWER];
        let targets = creep.room.find(FIND_STRUCTURES, {
          filter: (structure: StructureTypes) =>
            structureTypes.includes(structure.structureType) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
        // 按照 structureTypes 排序
        targets = _.sortBy(targets, (structure: StructureTypes) => structureTypes.indexOf(structure.structureType));

        if (targets.length > 0) {
          // 有能存矿的建筑 前去存矿
          if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#00d9ff' } });
          }
        } else {
          // 没有能存矿的建筑 前去集结点等待
          const collectFlag = this.room.find(FIND_FLAGS, { filter: flag => flag.name === 'HFlag' })?.[0];
          if (collectFlag) {
            creep.moveTo(collectFlag, { visualizePathStyle: { stroke: '#ffffff' } });
          } else {
            creep.say('没找到 HFlag');
          }
        }
      } else {
        const source = Game.getObjectById('5bbcac8a9099fc012e635a89' as Id<_HasId>) as Source;
        // 装载量有空余 前去挖矿
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle: { stroke: '#ffff00' } });
        }
      }
    }
  }
}
