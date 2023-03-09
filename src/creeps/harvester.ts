import CreepBase from './creepBase';
import { sourceStore, containerStore, linkStore } from '../store';

/**
 * 采集者
 */
export default class Harvester extends CreepBase {
  protected readonly sources;

  public constructor(room: Room, maximum = 3) {
    super(room, 'harvester');
    this.sources = sourceStore.my.get(room.name) ?? [];
    let transportMode = true;
    for (const source of this.sources) {
      if (containerStore.nearSource.has(source.id) || linkStore.nearSource.has(source.id)) {
        transportMode = false;
        break;
      }
    }
    if (transportMode) {
      this.generate(maximum);
    } else {
      this.generate(this.sources.length);
    }
    this.run(transportMode);
  }

  /**
   * 执行工作
   * @param transportMode 是否启用运输模式
   * @private
   */
  private run(transportMode: boolean): void {
    for (const creep of this.creeps) {
      if (transportMode) {
        // 兼顾运输模式
        if (this.renewTick(creep)) continue;

        if (!creep.memory.working && creep.store.getUsedCapacity() === 0) {
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
        let source = creep.pos.findInRange(FIND_SOURCES, 1)[0];
        if (!source) {
          for (const src of this.sources) {
            if (!sourceStore.harvesting.has(src.id)) {
              source = src;
              break;
            }
          }
        } else if (creep.ticksToLive === 1) {
          sourceStore.harvesting.delete(source.id);
        }
        if (!source) return;

        if (creep.store.getFreeCapacity() > 0) {
          const harvestResult = creep.harvest(source);
          if (harvestResult === OK) {
            sourceStore.harvesting.add(source.id);
          } else if (harvestResult === ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
          }
        } else {
          const targetLink = linkStore.nearSource
            .get(source.id)
            ?.find(link => link.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
          if (targetLink) {
            if (creep.transfer(targetLink, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(targetLink);
            }
            return;
          }

          const targetContainer = containerStore.nearSource
            .get(source.id)
            ?.find(container => container.store.getFreeCapacity() ?? 0 > 0);
          if (targetContainer) {
            if (creep.transfer(targetContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(targetContainer);
            }
          }
        }
      }
    }
  }
}
