import CreepBase from './creepBase';

/**
 * 建造者
 */
export default class Builder extends CreepBase {
  public constructor(room: Room, maximum = 3) {
    super(room, 'builder', maximum);
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
        creep.say('🧱 去建造');
      }

      if (creep.memory.working) {
        // 筛选建筑工地 并按剩余进度升序排列
        const targets = this.room
          .find(FIND_CONSTRUCTION_SITES)
          .sort((pre, cur) => pre.progressTotal - pre.progress - (cur.progressTotal - cur.progress));

        if (targets.length > 0) {
          // 如果建筑工地存在 则去施工
          if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#0000ff' } });
          }
        } else {
          // 否则前去集结点等待
          const collectFlag = this.room.find(FIND_FLAGS, { filter: flag => flag.name === 'BFlag' })?.[0];
          if (collectFlag) {
            creep.moveTo(collectFlag, { visualizePathStyle: { stroke: '#ffffff' } });
          } else {
            creep.say('没找到 BFlag');
          }
        }
      } else {
        const targets = this.room.find(FIND_STRUCTURES, {
          filter: structure =>
            structure.structureType === STRUCTURE_CONTAINER && structure.store.getCapacity(RESOURCE_ENERGY) > 0
        });
        if (targets.length > 0) {
          if (creep.withdraw(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffff00' } });
          }
        } else {
          const source = Game.getObjectById('5bbcac8a9099fc012e635a87' as Id<_HasId>) as Source;
          if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffff00' } });
          }
        }
      }
    }
  }
}
