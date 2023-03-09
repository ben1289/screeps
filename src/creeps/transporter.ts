import { sortBy } from 'lodash-es';
import CreepBase from './creepBase';
import { containerStore, linkStore } from '../store';

/**
 * 运输工
 */
export default class Transporter extends CreepBase {
  public constructor(room: Room, maximum = 1) {
    super(room, 'transporter');

    if (room.controller?.level ?? 0 >= 2) {
      this.generate(maximum);
      this.run();
    } else {
      this.recycleAll();
    }
  }

  private run(): void {
    for (const creep of this.creeps) {
      if (this.renewTick(creep)) continue;

      if (!creep.memory.working && creep.store.getUsedCapacity() === 0) {
        creep.memory.working = true;
        creep.say('一滴不剩了 去拿货');
      }
      if (creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = false;
        creep.say('满了满了 去存货');
      }

      if (creep.memory.working) {
        const targets: (StructureContainer | StructureLink)[] = [...(linkStore.other.get(this.room.name) ?? [])];
        for (const [sourceId, containers] of containerStore.nearSource) {
          if (Game.getObjectById(sourceId)?.room.name === this.room.name) {
            targets.push(...containers);
          }
        }
        const bestContainer = sortBy(targets, container => container.store.getFreeCapacity(RESOURCE_ENERGY)).find(
          container => container.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        );
        if (!bestContainer) return;

        if (creep.withdraw(bestContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(bestContainer);
        }
      } else {
        this.toStore(creep);
      }
    }
  }
}
