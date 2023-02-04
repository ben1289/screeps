import Creep from './creep';

export default class Upgrader extends Creep {
  public constructor(room: Room, maximum = 3) {
    super(room, [WORK, MOVE, CARRY], 'upgrader', maximum);
  }

  public run(): void {
    for (const upgrader of this.creeps) {
      if (upgrader.memory.upgrading && upgrader.store[RESOURCE_ENERGY] === 0) {
        upgrader.memory.upgrading = false;
        upgrader.say('🔄 去挖矿');
      }
      if (!upgrader.memory.upgrading && upgrader.store.getFreeCapacity() === 0) {
        upgrader.memory.upgrading = true;
        upgrader.say('⚡ 去升级');
      }

      if (upgrader.memory.upgrading) {
        if (upgrader.upgradeController(this.room.controller as StructureController) === ERR_NOT_IN_RANGE) {
          upgrader.moveTo(this.room.controller as StructureController, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      } else {
        const source = Game.getObjectById('5bbcae0a9099fc012e63858f' as Id<_HasId>) as Source;
        if (upgrader.harvest(source) === ERR_NOT_IN_RANGE) {
          upgrader.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
    }
  }
}
