import CreepBase from './creepBase';

/**
 * 维修者
 */
export default class Repairer extends CreepBase {
  public constructor(room: Room, maximum = 1) {
    super(room, 'repairer');
    this.generate(maximum);
    this.run();
  }

  private run(): void {
    for (const creep of this.creeps) {
      if (this.renewTick(creep)) continue;

      if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = true;
        creep.say('尅饱了 去维修');
      }
      if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.working = false;
        creep.say('特么饿了 去干饭');
      }

      if (creep.memory.working) {
        const targets = this.room.find(FIND_STRUCTURES, {
          // 排除墙和城墙
          filter: structure =>
            structure.structureType !== STRUCTURE_WALL &&
            structure.structureType !== STRUCTURE_RAMPART &&
            structure.hitsMax - structure.hits > 0
        });
        targets.sort((pre, cur) => pre.hits - cur.hits);
        if (targets.length > 0) {
          // 如果有损坏的建筑 则去修理
          if (creep.repair(targets[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0]);
          }
        } else {
          this.toMass(creep);
        }
      } else {
        if (this.toWithdraw(creep) === ERR_NOT_ENOUGH_ENERGY) {
          this.toHarvest(creep);
        }
      }
    }
  }
}
