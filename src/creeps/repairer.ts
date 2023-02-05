import Creep from './creep';

export default class Repairer extends Creep {
  public constructor(room: Room, maximum = 3) {
    super(room, 'repairer', undefined, maximum);
  }

  public run(): void {
    for (const repairer of this.creeps) {
      if (repairer.memory.working && repairer.store[RESOURCE_ENERGY] === 0) {
        repairer.memory.working = false;
        repairer.say('⛏️ 去挖矿');
      }
      if (!repairer.memory.working && repairer.store.getFreeCapacity() === 0) {
        repairer.memory.working = true;
        repairer.say('🛠️ 去维修');
      }

      if (repairer.memory.working) {
        let targets = this.room.find(FIND_STRUCTURES, {
          filter: (structure: Structure) => structure.hitsMax - structure.hits > 0
        });
        // 将道路的优先级提高
        const roads = targets.filter(structure => structure.structureType === STRUCTURE_ROAD);
        targets = roads.length > 0 ? roads : targets;
        targets.sort((pre, cur) => pre.hits - cur.hits);

        if (targets.length > 0) {
          // 如果有损坏的建筑 则去修理
          if (repairer.repair(targets[0]) === ERR_NOT_IN_RANGE) {
            repairer.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
          }
        } else {
          // 否则集中到一边
          repairer.moveTo(27, 24);
        }
      } else {
        const source = Game.getObjectById('5bbcae0a9099fc012e638590' as Id<_HasId>) as Source;
        if (repairer.harvest(source) === ERR_NOT_IN_RANGE) {
          repairer.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
    }
  }
}
