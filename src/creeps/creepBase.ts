import { getBodyPartList } from '../utils';

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
    const roleLevel = this.room.memory.roleLevel[role] ?? 1;
    const curLvBody = bodies[roleLevel - 1];
    const nextLvBody = bodies[roleLevel];
    for (const spawn of this.spawns) {
      // 如果能量够升级角色的 则生成下一等级的 creep
      if (
        nextLvBody &&
        spawn.spawnCreep(nextLvBody, `${role}_${Date.now()}`, {
          memory: {
            role,
            level: roleLevel + 1
          }
        }) === OK
      ) {
        this.room.memory.roleLevel[role] = roleLevel + 1;
        // 如果已经满员 则杀死最短生命的 creep
        if (this.creeps.length >= maximum) {
          this.creeps.sort((pre, cur) => (pre.ticksToLive ?? 0) - (cur.ticksToLive ?? 0));
          this.creeps[0].suicide();
        }
      } else {
        if (this.creeps.length < maximum) {
          spawn.spawnCreep(curLvBody, `${role}_${Date.now()}`, { memory: { role, level: roleLevel } });
        }
      }
    }
  }

  /**
   * 续命
   * @protected
   */
  protected renewTick(creep: Creep): boolean {
    if (creep.ticksToLive && creep.ticksToLive < 200) {
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
