export default class CreepClass {
  protected room;
  protected spawns;
  protected readonly creeps;

  public constructor(room: Room, role: string, body: BodyPartConstant[] = [MOVE, WORK, CARRY], maximum?: number) {
    this.room = room;
    this.spawns = room.find(FIND_MY_SPAWNS);
    this.creeps = room.find(FIND_MY_CREEPS, { filter: creep => creep.memory.role === role });
    const RCL = room.controller?.level ?? 0;
    if (RCL === 2) {
      body = [MOVE, MOVE, WORK, WORK, CARRY, CARRY];
    } else if (RCL === 3) {
      body = [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY];
    }
    this.generate(role, body, maximum);
  }

  /**
   * 生成 creep
   * @param role
   * @param body
   * @param maximum
   * @private
   */
  private generate(role: string, body: BodyPartConstant[], maximum = 3): void {
    for (const spawn of this.spawns) {
      if (this.creeps.length < maximum) {
        // 如果 creep 数量不足 则生成
        spawn.spawnCreep(body, `${role}_${Date.now()}`, { memory: { role, level: this.room.controller?.level ?? 0 } });
        spawn.spawning?.setDirections([TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM]);
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
    if (creep.memory.level !== this.room.controller?.level) {
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
