import Creep from './creep';

export default class Builder extends Creep {
  public constructor(room: Room, maximum = 3) {
    super(room, 'builder', undefined, maximum);
  }

  public run(): void {
    for (const builder of this.creeps) {
      if (this.renewTick(builder)) return;
      if (builder.memory.working && builder.store[RESOURCE_ENERGY] === 0) {
        builder.memory.working = false;
        builder.say('⛏️ 去挖矿');
      }
      if (!builder.memory.working && builder.store.getFreeCapacity() === 0) {
        builder.memory.working = true;
        builder.say('🧱 去建造');
      }

      if (builder.memory.working) {
        // 筛选建筑工地 并按剩余进度升序排列
        const targets = this.room
          .find(FIND_CONSTRUCTION_SITES)
          .sort((pre, cur) => pre.progressTotal - pre.progress - (cur.progressTotal - cur.progress));

        if (targets.length > 0) {
          // 如果建筑工地存在 则去施工
          if (builder.build(targets[0]) === ERR_NOT_IN_RANGE) {
            builder.moveTo(targets[0], { visualizePathStyle: { stroke: '#0000ff' } });
          }
        } else {
          // 否则集中到一边
          builder.moveTo(23, 18, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      } else {
        const targets = this.room.find(FIND_STRUCTURES, {
          filter: structure =>
            structure.structureType === STRUCTURE_CONTAINER && structure.store.getCapacity(RESOURCE_ENERGY) > 0
        });
        if (targets.length > 0) {
          if (builder.withdraw(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            builder.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffff00' } });
          }
        } else {
          const source = Game.getObjectById('5bbcae0a9099fc012e638590' as Id<_HasId>) as Source;
          if (builder.harvest(source) === ERR_NOT_IN_RANGE) {
            builder.moveTo(source, { visualizePathStyle: { stroke: '#ffff00' } });
          }
        }
      }
    }
  }
}
