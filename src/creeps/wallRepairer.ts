import { sortBy, filter } from 'lodash-es';
import CreepBase from './creepBase';

/**
 * 城墙维修者
 */
export default class WallRepairer extends CreepBase {
  private readonly walls: (StructureWall | StructureRampart)[];

  public constructor(room: Room, maximum = 1) {
    super(room, 'wallRepairer');
    this.walls = this.room.find(FIND_STRUCTURES, {
      filter: structure => structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART
    });
    if (this.walls.length > 0) {
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
        creep.say('尅饱了 去加固墙体');
      }
      if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.working = false;
        creep.say('特么饿了 去干饭');
      }

      if (creep.memory.working) {
        const targets = sortBy(
          filter(this.walls, structure => structure.hitsMax - structure.hits > 0),
          'hits'
        );
        if (targets.length > 0) {
          if (creep.repair(targets[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0]);
          }
        } else {
          this.toMass(creep);
        }
      } else {
        if (this.toWithdraw(creep) === ERR_NOT_ENOUGH_ENERGY) {
          this.toHarvest(creep);
        }
      }
    }
  }
}
