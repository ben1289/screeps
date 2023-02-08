import CreepBase from './creepBase';

/**
 * 升级者
 */
export default class Updater extends CreepBase {
  public constructor(room: Room, maximum = 3) {
    super(room, 'updater', maximum);
  }

  public run(): void {
    for (const creep of this.creeps) {
      if (this.renewTick(creep)) return;
      if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.working = false;
        creep.say('⛏️ 去挖矿');
      }
      if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
        creep.memory.working = true;
        creep.say('⚡ 去升级');
      }

      if (creep.memory.working) {
        if (creep.upgradeController(this.room.controller as StructureController) === ERR_NOT_IN_RANGE) {
          creep.moveTo(this.room.controller as StructureController, { visualizePathStyle: { stroke: '#ff0000' } });
        }
      } else {
        const targets = this.room.find(FIND_STRUCTURES, {
          filter: structure =>
            structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        });
        if (targets.length > 0) {
          if (creep.withdraw(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffff00' } });
          }
        } else {
          const source = Game.getObjectById('5bbcac8a9099fc012e635a89' as Id<_HasId>) as Source;
          if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffff00' } });
          }
        }
      }
    }
  }
}
