export default class Creep {
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
        spawn.spawnCreep(body, `${role}_${Date.now()}`, { memory: { role } });
        spawn.spawning?.setDirections([TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM]);
      } else {
        // 如果 creep 数量充足 且存活时间小于200 tick 则去 spawn 续命
        for (const creep of this.creeps) {
          if (creep.ticksToLive && creep.ticksToLive < 200) {
            if (spawn.renewCreep(creep) === ERR_NOT_IN_RANGE) {
              creep.moveTo(spawn, { visualizePathStyle: { stroke: '#19ff00' } });
            }
          }
        }
        break;
      }
    }
  }
}
