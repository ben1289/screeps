import CreepBase from './creepBase';
import { mySource, linksNearSource, containersNearSource } from '../store';

/**
 * 采集者
 */
export default class Harvester extends CreepBase {
  protected readonly sources;

  public constructor(room: Room, maximum = 3) {
    super(room, 'harvester');
    this.sources = mySource.get(room.name) ?? [];
    if (this.sources.length > 0) {
      this.generate(this.sources.length);
      this.run(false);
    } else {
      this.generate(maximum);
      this.run(true);
    }
  }

  /**
   * 执行工作
   * @param transportMode 是否启用运输模式
   * @private
   */
  private run(transportMode: boolean): void {
    for (let i = 0; i < this.creeps.length; i++) {
      const creep = this.creeps[i];

      if (transportMode) {
        // 兼顾运输模式
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
      } else {
        // 仅采集模式
        const source = this.sources[i];

        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
          creep.moveTo(source);
        }

        if (creep.store.getFreeCapacity() === 0) {
          const link = (linksNearSource.get(source.id) ?? []).find(
            linkNearSource => creep.store.getUsedCapacity() <= (linkNearSource.store.getFreeCapacity() ?? 0)
          );
          if (link) {
            if (creep.transfer(link, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(link);
            }
            return;
          }

          const container = (containersNearSource.get(source.id) ?? []).find(
            containerNearSource => creep.store.getUsedCapacity() <= (containerNearSource.store.getFreeCapacity() ?? 0)
          );
          if (container) {
            if (creep.transfer(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(container);
            }
          }
        }
      }
    }
  }
}
