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
        spawn.spawnCreep(body, `${role}_${Date.now()}`, { memory: { role } });
      } else {
        break;
      }
    }
  }
}
