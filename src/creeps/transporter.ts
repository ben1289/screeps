import { sortBy } from 'lodash-es';
import CreepBase from './creepBase';
import { mySource, containersNearSource, linksNearSource, otherLinks } from '../store';

/**
 * 运输工
 */
export default class Transporter extends CreepBase {
  protected readonly room;

  public constructor(room: Room, maximum = 1) {
    super(room, 'transporter');
    this.room = room;

    if (containersNearSource.size > 0 || linksNearSource.size > 0) {
      this.generate(maximum);
      this.run();
    } else {
      this.recycleAll();
    }
  }

  private run(): void {
    for (const creep of this.creeps) {
      if (this.renewTick(creep)) continue;

      const sources = mySource.get(this.room.name) ?? [];
      const containers: (StructureContainer | StructureLink)[] = [...(otherLinks.get(this.room.name) ?? [])];
      for (const source of sources) {
        containers.push(...(containersNearSource.get(source.id) ?? []));
      }

      const bestContainer = sortBy(containers, container => container.store.getFreeCapacity())[0];
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
