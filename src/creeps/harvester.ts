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
        this.toStore(creep, 'HFlag');
      } else {
        // 装载量有空余 前去挖矿
        this.toHarvest(creep);
      }
    }
  }
}
