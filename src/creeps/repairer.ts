import Creep from './creep';

/**
 * 维修者
 */
export default class Repairer extends Creep {
  public constructor(room: Room, maximum = 3) {
    super(room, 'repairer', undefined, maximum);
  }

  public run(): void {
    for (const repairer of this.creeps) {
      if (this.renewTick(repairer)) return;
      if (repairer.memory.working && repairer.store[RESOURCE_ENERGY] === 0) {
        repairer.memory.working = false;
        repairer.say('⛏️ 去挖矿');
      }
      if (!repairer.memory.working && repairer.store.getFreeCapacity() === 0) {
        repairer.memory.working = true;
        repairer.say('🛠️ 去维修');
      }

      if (repairer.memory.working) {
        const targets = this.room.find(FIND_STRUCTURES, {
          filter: (structure: Structure) =>
            structure.structureType !== STRUCTURE_WALL && structure.hitsMax - structure.hits > 0
        });
        targets.sort((pre, cur) => pre.hits - cur.hits);

        if (targets.length > 0) {
          // 如果有损坏的建筑 则去修理
          if (repairer.repair(targets[0]) === ERR_NOT_IN_RANGE) {
            repairer.moveTo(targets[0], { visualizePathStyle: { stroke: '#ff8700' } });
          }
        } else {
          // 否则集中到一边
          repairer.moveTo(27, 24);
        }
      } else {
        const targets = this.room.find(FIND_STRUCTURES, {
          filter: structure =>
            structure.structureType === STRUCTURE_CONTAINER && structure.store.getCapacity(RESOURCE_ENERGY) > 0
        });
        if (targets.length > 0) {
          if (repairer.withdraw(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            repairer.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffff00' } });
          }
        } else {
          const source = Game.getObjectById('5bbcae0a9099fc012e63858f' as Id<_HasId>) as Source;
          if (repairer.harvest(source) === ERR_NOT_IN_RANGE) {
            repairer.moveTo(source, { visualizePathStyle: { stroke: '#ffff00' } });
          }
        }
      }
    }
  }
}
