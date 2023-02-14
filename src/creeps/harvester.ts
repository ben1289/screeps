import CreepBase from './creepBase';
import { getObjectById } from '../utils';

/**
 * 采集者
 */
export default class Harvester extends CreepBase {
  private readonly sourceContainer;

  public constructor(room: Room, maximum = 3) {
    super(room, 'harvester');
    this.sourceContainer = this.room.memory.sourceContainer;
    if (this.sourceContainer.length > 0) {
      this.generate(this.sourceContainer.length);
    } else {
      this.generate(maximum);
    }
    this.run();
  }

  private run(): void {
    for (let i = 0; i < this.creeps.length; i++) {
      const creep = this.creeps[i];

      if (this.sourceContainer.length > 0) {
        const source = getObjectById<Source>(this.sourceContainer[i].sourceId);
        const container = getObjectById<StructureContainer>(this.sourceContainer[i].containerId);
        if (creep.pos.isEqualTo(container)) {
          creep.harvest(source);
        } else {
          creep.moveTo(container);
        }
        if (creep.store.getFreeCapacity() === 0) {
          if (creep.store.getUsedCapacity() <= container.store.getFreeCapacity()) {
            creep.drop(RESOURCE_ENERGY);
          } else {
            const links = this.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } });
            for (const link of links) {
              if (creep.pos.isNearTo(link)) {
                creep.transfer(link, RESOURCE_ENERGY);
              }
            }
          }
        }
      } else {
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
}
