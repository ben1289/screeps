import Creep from './creep';

export default class Updater extends Creep {
  public constructor(room: Room, maximum = 3) {
    super(room, [WORK, MOVE, CARRY], 'upgrader', maximum);
  }

  public run(): void {
    for (const updater of this.creeps) {
      if (updater.memory.working && updater.store[RESOURCE_ENERGY] === 0) {
        updater.memory.working = false;
        updater.say('⛏️ 去挖矿');
      }
      if (!updater.memory.working && updater.store.getFreeCapacity() === 0) {
        updater.memory.working = true;
        updater.say('⚡ 去升级');
      }

      if (updater.memory.working) {
        if (updater.upgradeController(this.room.controller as StructureController) === ERR_NOT_IN_RANGE) {
          updater.moveTo(this.room.controller as StructureController, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      } else {
        const source = Game.getObjectById('5bbcae0a9099fc012e63858f' as Id<_HasId>) as Source;
        if (updater.harvest(source) === ERR_NOT_IN_RANGE) {
          updater.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
    }
  }
}
