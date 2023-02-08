import { getBodyPartList } from '../utils';

export default class CreepBase {
  protected room;
  protected spawns;
  protected readonly creeps;

  public constructor(room: Room, role: CreepRole, maximum: number) {
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
  private generate(role: CreepRole, maximum: number): void {
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
        // 并将该角色最高等级提升一级
        this.room.memory.roleLevel[role] = roleLevel + 1;
      } else {
        if (this.creeps.length < maximum) {
          // 如果不满员 则生成 creep
          spawn.spawnCreep(curLvBody, `${role}_${Date.now()}`, { memory: { role, level: roleLevel } });
        } else if (this.creeps.length === maximum) {
          // 如果刚刚满员 则判断有无低等级 creep 有则生成 creep
          if (this.creeps.findIndex(creep => creep.memory.level < roleLevel) !== -1) {
            spawn.spawnCreep(curLvBody, `${role}_${Date.now()}`, { memory: { role, level: roleLevel } });
          }
        } else {
          // 如果超员 则将冗余的 creep 杀掉
          const overflowNum = this.creeps.length - maximum;
          const creeps = _.sortBy(this.creeps, creep => creep.memory.level, 'ticksToLive');
          for (let i = 0; i < overflowNum; i++) {
            creeps[i].suicide();
          }
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
