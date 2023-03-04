export default class Tower {
  protected room;
  protected towers: StructureTower[];

  public constructor(room: Room) {
    this.room = room;
    this.towers = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
  }

  /**
   * 启用攻击
   */
  public enableAttack(): void {
    const bodyTypes = [WORK, ATTACK, RANGED_ATTACK, HEAL, CLAIM];
    type BodyType = typeof bodyTypes extends [infer T] ? T : never;
    const creeps = this.room.find(FIND_HOSTILE_CREEPS, {
      filter: creep => creep.body.findIndex(body => bodyTypes.includes(body.type as BodyType)) !== -1
    });
    for (const tower of this.towers) {
      const closestCreep = tower.pos.findClosestByRange(creeps);
      if (closestCreep) {
        tower.attack(closestCreep);
      }
    }
  }

  /**
   * 启用治疗
   */
  public enableHeal(): void {
    // TODO 治疗相关代码
  }

  /**
   * 启用维修
   */
  public enableRepair(): void {
    // TODO 维修相关代码
  }
}
