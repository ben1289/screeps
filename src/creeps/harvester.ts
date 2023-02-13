import CreepBase from './creepBase';

/**
 * 采集者
 */
export default class Harvester extends CreepBase {
  public constructor(room: Room, maximum = 3) {
    super(room, 'harvester');
    this.generate(maximum);
    this.run();
  }

  private run(): void {
    for (const creep of this.creeps) {
      if (this.renewTick(creep)) continue;

      if (!creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.working = true;
      }
      if (creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = false;
      }

      if (creep.memory.working) {
        this.toHarvest(creep);
      } else {
        this.toStore(creep);
      }
    }
  }
}
