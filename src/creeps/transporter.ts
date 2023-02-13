import CreepBase from './creepBase';

/**
 * 运输工
 */
export default class Transporter extends CreepBase {
  private readonly containers: StructureContainer[];

  public constructor(room: Room, maximum = 1) {
    super(room, 'transporter');

    this.containers = room.find(FIND_STRUCTURES, { filter: { structureType: StructureContainer } });
    if (this.containers.length > 0) {
      this.generate(maximum);
      this.run();
    } else {
      this.recycleAll();
    }
  }

  private run(): void {
    for (const creep of this.creeps) {
      if (this.renewTick(creep)) continue;

      const bestContainer = _.sortBy(this.containers, container => container.store.getFreeCapacity())[0];
      if (!creep.memory.working && creep.store.getUsedCapacity() === 0) {
        creep.memory.working = true;
        creep.say('一滴不剩了 去拿货');
      }
      if (
        creep.memory.working &&
        (creep.store.getFreeCapacity() === 0 || bestContainer.store.getUsedCapacity() === 0)
      ) {
        creep.memory.working = false;
        creep.say('满了满了 去存货');
      }

      if (creep.memory.working) {
        if (creep.withdraw(bestContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(bestContainer);
        }
      } else {
        this.toStore(creep);
      }
    }
  }
}
