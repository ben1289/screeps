export default class Creep {
  protected room;
  protected spawns;
  protected readonly creeps;
  protected readonly body;

  public constructor(room: Room, body: BodyPartConstant[], role: string, maximum: number) {
    this.room = room;
    this.spawns = room.find(FIND_MY_SPAWNS);
    this.creeps = room.find(FIND_MY_CREEPS, { filter: creep => creep.memory.role === role });
    this.body = body;
    this.generate(role, maximum);
  }

  /**
   * 生成 creep
   * @param role
   * @param maximum
   * @private
   */
  private generate(role: string, maximum: number): void {
    for (const spawn of this.spawns) {
      if (this.creeps.length < maximum) {
        spawn.spawnCreep(this.body, `${role}_${Date.now()}`, { memory: { role } });
      } else {
        break;
      }
    }
  }
}
