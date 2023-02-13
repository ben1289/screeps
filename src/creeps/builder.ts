import { sortBy } from 'lodash-es';
import CreepBase from './creepBase';

/**
 * 建造者
 */
export default class Builder extends CreepBase {
  private readonly constructionSites: ConstructionSite[];

  public constructor(room: Room, maximum = 2) {
    super(room, 'builder');
    this.constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
    if (this.constructionSites.length > 0) {
      this.generate(maximum);
      this.run();
    } else {
      this.recycleAll();
    }
  }

  private run(): void {
    for (const creep of this.creeps) {
      if (this.renewTick(creep)) continue;

      if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = true;
        creep.say('尅饱了 去施工');
      }
      if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.working = false;
        creep.say('特么饿了 去干饭');
      }

      if (creep.memory.working) {
        // 筛选建筑工地 并按剩余进度升序排列
        const targets = sortBy(this.constructionSites, site => site.progressTotal - site.progress);
        if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0]);
        }
      } else {
        if (this.toWithdraw(creep) === ERR_NOT_ENOUGH_ENERGY) {
          this.toHarvest(creep);
        }
      }
    }
  }
}
