import CreepBase from './creepBase';

/**
 * 城墙维修者
 */
export default class WallRepairer extends CreepBase {
  public constructor(room: Room, maximum = 2) {
    super(room, 'wallRepairer', maximum);
  }

  public run(): void {
    for (const creep of this.creeps) {
      if (this.renewTick(creep)) return;

      if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.working = false;
      }
      if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = true;
      }

      if (creep.memory.working) {
        const targets = this.room.find(FIND_STRUCTURES, {
          filter: structure =>
            (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) &&
            structure.hitsMax - structure.hits > 0
        });
        targets.sort((pre, cur) => pre.hits - cur.hits);
        if (targets.length > 0) {
          if (creep.repair(targets[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ff8700' } });
          }
        } else {
          // 否则前去集结点等待
          const collectFlag = this.room.find(FIND_FLAGS, { filter: flag => flag.name === 'WRFlag' })?.[0];
          if (collectFlag) {
            creep.moveTo(collectFlag, { visualizePathStyle: { stroke: '#ffffff' } });
          } else {
            creep.say('没找到 WRFlag');
          }
        }
      } else {
        if (this.toWithDraw(creep) === ERR_NOT_ENOUGH_ENERGY) {
          this.toHarvest(creep);
        }
      }
    }
  }
}
