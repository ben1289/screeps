import CreepBase from './creepBase';

/**
 * 升级者
 */
export default class Updater extends CreepBase {
  public constructor(room: Room, maximum = 3) {
    super(room, 'updater', maximum);
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
        creep.say('⚡ 去升级');
      }

      if (creep.memory.working) {
        if (creep.upgradeController(this.room.controller as StructureController) === ERR_NOT_IN_RANGE) {
          creep.moveTo(this.room.controller as StructureController, { visualizePathStyle: { stroke: '#ff0000' } });
        }
      } else {
        if (this.toWithdraw(creep) === ERR_NOT_ENOUGH_ENERGY) {
          this.toHarvest(creep);
        }
      }
    }
  }
}
