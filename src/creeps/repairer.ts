import CreepBase from './creepBase';

/**
 * 维修者
 */
export default class Repairer extends CreepBase {
  public constructor(room: Room, maximum = 3) {
    super(room, 'repairer', maximum);
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
        creep.say('🛠️ 去维修');
      }

      if (creep.memory.working) {
        const targets = this.room.find(FIND_STRUCTURES, {
          filter: (structure: Structure) =>
            structure.structureType !== STRUCTURE_WALL && structure.hitsMax - structure.hits > 0
        });
        targets.sort((pre, cur) => pre.hits - cur.hits);

        if (targets.length > 0) {
          // 如果有损坏的建筑 则去修理
          if (creep.repair(targets[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ff8700' } });
          }
        } else {
          // 否则前去集结点等待
          const collectFlag = this.room.find(FIND_FLAGS, { filter: flag => flag.name === 'RFlag' })?.[0];
          if (collectFlag) {
            creep.moveTo(collectFlag, { visualizePathStyle: { stroke: '#ffffff' } });
          } else {
            creep.say('没找到 RFlag');
          }
        }
      } else {
        const targets = this.room.find(FIND_STRUCTURES, {
          filter: structure =>
            structure.structureType === STRUCTURE_CONTAINER && structure.store.getCapacity(RESOURCE_ENERGY) > 0
        });
        if (targets.length > 0) {
          if (creep.withdraw(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffff00' } });
          }
        } else {
          const source = Game.getObjectById('5bbcac8a9099fc012e635a87' as Id<_HasId>) as Source;
          if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffff00' } });
          }
        }
      }
    }
  }
}
