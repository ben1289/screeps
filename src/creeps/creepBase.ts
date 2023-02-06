import { getBodyPartList, getBodyNeedEnergy, getEnergyCapacity } from '../utils';

export default class CreepBase {
  protected room;
  protected spawns;
  protected readonly creeps;

  public constructor(room: Room, role: CreepRole, maximum?: number) {
    this.room = room;
    this.spawns = room.find(FIND_MY_SPAWNS);
    this.creeps = room.find(FIND_MY_CREEPS, { filter: creep => creep.memory.role === role });
    this.generate(role, maximum);
  }

  /**
   * 生成 creep
   * @param role
   * @param maximum
   * @private
   */
  private generate(role: CreepRole, maximum = 3): void {
    const bodies: BodyPartConstant[][] = getBodyPartList(role);
    for (const spawn of this.spawns) {
      // 如果 creep 数量不足 则生成
      if (this.creeps.length < maximum) {
        for (let i = bodies.length - 1; i >= 0; i--) {
          const body = bodies[i];
          if (getBodyNeedEnergy(body) <= getEnergyCapacity(this.room, 'getCapacity')) {
            const level = i + 1;
            // 采用最佳身体部件生成 creep
            spawn.spawnCreep(body, `${role}_${Date.now()}`, { memory: { role, level } });
            this.room.memory.creepLevel = level;
            return;
          }
        }
      } else {
        break;
      }
    }
  }

  /**
   * 续命
   * @protected
   */
  protected renewTick(creep: Creep): boolean {
    if (creep.memory.level !== this.room.memory.creepLevel) {
      creep.memory.needRenew = false;
    } else if (creep.ticksToLive && creep.ticksToLive < 200) {
      creep.memory.needRenew = true;
    } else if (creep.ticksToLive && creep.ticksToLive > 1400) {
      creep.memory.needRenew = false;
    }

    if (creep.memory.needRenew === true) {
      // 求出最近路径的 spawn
      const spawnIndex = this.spawns
        .map((spawn, index) => ({ steps: spawn.room.findPath(creep.pos, spawn.pos), index }))
        .sort((pre, cur) => pre.steps.length - cur.steps.length)?.[0].index;
      const bestSpawn = this.spawns[spawnIndex];

      const renewResult = bestSpawn.renewCreep(creep);
      if (renewResult === ERR_NOT_IN_RANGE) {
        creep.moveTo(bestSpawn, { visualizePathStyle: { stroke: '#19ff00' } });
      } else if (renewResult === ERR_NOT_ENOUGH_ENERGY) {
        // 如果能量不足则先不续命
        creep.memory.needRenew = false;
        return false;
      }
      return true;
    } else {
      return false;
    }
  }
}
