import CreepBase from './creepBase';

/**
 * 拾荒者
 */
export default class Scavenger extends CreepBase {
  public constructor(room: Room, maximum = 1) {
    super(room, 'scavenger');
    this.generate(maximum);
    this.run();
  }

  private run(): void {
    for (const creep of this.creeps) {
      if (this.renewTick(creep)) continue;

      const dropped = this.room.find(FIND_DROPPED_RESOURCES);
      const tombstones = this.room.find(FIND_TOMBSTONES, {
        filter: tombstone => tombstone.store.getUsedCapacity() > 0
      });
      creep.memory.working = (dropped.length > 0 || tombstones.length > 0) && creep.store.getFreeCapacity() > 0;

      if (creep.memory.working) {
        if (dropped[0] && creep.pickup(dropped[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(dropped[0]);
        } else if (tombstones[0] && creep.withdraw(tombstones[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(tombstones[0]);
        }
      } else {
        this.toStore(creep);
      }
    }
  }
}
