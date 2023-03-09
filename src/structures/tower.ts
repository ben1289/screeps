import { roomStore, towerStore } from '../store';

/**
 * 启用攻击
 */
function enableAttack(): void {
  for (const room of roomStore.my) {
    const bodyTypes = [WORK, ATTACK, RANGED_ATTACK, HEAL, CLAIM];
    type BodyType = typeof bodyTypes extends [infer T] ? T : never;
    const creeps = room.find(FIND_HOSTILE_CREEPS, {
      filter: creep => creep.body.findIndex(body => bodyTypes.includes(body.type as BodyType)) !== -1
    });
    const towers = towerStore.my.get(room.name) ?? [];
    for (const tower of towers) {
      const closestCreep = tower.pos.findClosestByRange(creeps);
      if (closestCreep) {
        tower.attack(closestCreep);
      }
    }
  }
}

/**
 * 启用治疗
 */
function enableHeal(): void {
  // TODO 治疗相关代码
}

/**
 * 启用维修
 */
function enableRepair(): void {
  // TODO 维修相关代码
}

export default {
  enableAttack,
  enableHeal,
  enableRepair
};
