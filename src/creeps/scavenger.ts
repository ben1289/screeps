import CreepBase from './creepBase';

/**
 * 拾荒者
 */
export default class Scavenger extends CreepBase {
  public constructor(room: Room, maximum?: number) {
    super(room, 'scavenger', maximum);
  }

  public run(): void {
    for (const scavenger of this.creeps) {
      const dropped = this.room.find(FIND_DROPPED_RESOURCES);
      if (scavenger.pickup(dropped[0]) === ERR_NOT_IN_RANGE) {
        scavenger.moveTo(dropped[0], { visualizePathStyle: { stroke: '#00d9ff' } });
      }

      const tombstones = this.room.find(FIND_TOMBSTONES);
      if (scavenger.withdraw(tombstones[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        scavenger.moveTo(tombstones[0], { visualizePathStyle: { stroke: '#00d9ff' } });
      }
    }
  }
}
