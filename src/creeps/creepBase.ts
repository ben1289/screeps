import { sortBy } from 'lodash-es';
import { getBodyPartList } from '../utils';

export default class CreepBase {
  private readonly role;
  protected readonly room;
  protected readonly spawns;
  protected readonly creeps;

  public constructor(room: Room, role: CreepRole) {
    this.role = role;
    this.room = room;
    this.spawns = room.find(FIND_MY_SPAWNS);
    this.creeps = room.find(FIND_MY_CREEPS, { filter: creep => creep.memory.role === role });
  }

  /**
   * 寻找最近的目标
   * @param creep
   * @param targets
   * @protected
   */
  protected findBestTarget<T extends Structure | Source>(creep: Creep, targets: T[]): T | null {
    if (targets.length === 1) {
      return targets[0];
    } else if (targets.length > 1) {
      return sortBy(targets, target => this.room.findPath(creep.pos, target.pos).length)[0];
    } else {
      return null;
    }
  }

  /**
   * 孵化 creep
   * @param spawn
   * @param level
   * @private
   */
  private spawnCreep(spawn: StructureSpawn, level: number): ScreepsReturnCode | void {
    const role = this.role;
    const body = getBodyPartList(role)[level - 1];
    if (body) {
      return spawn.spawnCreep(body, `${role}_lv${level}_${Date.now()}`, { memory: { role, level } });
    }
  }

  /**
   * 生成 creep
   * @param maximum
   * @protected
   */
  protected generate(maximum: number): void {
    const role = this.role;
    const curLevel = this.room.memory.roleLevel[role] ?? 1;
    const nextLevel = curLevel + 1;
    for (const spawn of this.spawns) {
      // 如果能量够升级角色的 则生成下一等级的 creep
      if (this.spawnCreep(spawn, nextLevel) === OK) {
        // 并将该角色最高等级提升一级
        this.room.memory.roleLevel[role] = nextLevel;
      } else {
        if (this.creeps.length < maximum) {
          // 如果不满员 则生成 creep
          if (
            this.spawnCreep(spawn, curLevel) === ERR_NOT_ENOUGH_ENERGY &&
            role === 'harvester' &&
            this.creeps.length === 0 &&
            curLevel > 1
          ) {
            // 如果能量不足生成 且没有 creep 则将该角色最高等级降低一级
            this.room.memory.roleLevel[role] = curLevel - 1;
          }
        } else if (this.creeps.length === maximum) {
          // 如果刚刚满员 则判断有无低等级 creep 有则生成 creep
          if (this.creeps.findIndex(creep => creep.memory.level < curLevel) !== -1) {
            this.spawnCreep(spawn, curLevel);
          }
        } else {
          // 如果超员 则将冗余的 creep 杀掉
          const overflowNum = this.creeps.length - maximum;
          const creeps = sortBy(this.creeps, creep => creep.memory.level, 'ticksToLive');
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
   * @return 是否需要续命
   */
  protected renewTick(creep: Creep): boolean {
    if (creep.ticksToLive && creep.ticksToLive < 200) {
      creep.memory.needRenew = true;
    } else if (creep.ticksToLive && creep.ticksToLive > 1400) {
      creep.memory.needRenew = false;
    }

    if (creep.memory.needRenew === true) {
      const bestSpawn = this.findBestTarget(creep, this.spawns);
      if (bestSpawn) {
        const renewResult = bestSpawn.renewCreep(creep);
        if (renewResult === OK) {
          return true;
        }
        if (renewResult === ERR_NOT_IN_RANGE) {
          creep.moveTo(bestSpawn, { visualizePathStyle: { stroke: '#00ff00' } });
          return true;
        }
      }
      creep.memory.needRenew = false;
    }
    return false;
  }

  /**
   * 回收 creep
   * @protected
   */
  protected recycle(creep: Creep): void {
    const bestSpawn = this.findBestTarget(creep, this.spawns);
    if (bestSpawn?.recycleCreep(creep) === ERR_NOT_IN_RANGE) {
      creep.moveTo(bestSpawn);
    }
  }

  /**
   * 回收全部 creep
   * @protected
   */
  protected recycleAll(): void {
    for (const creep of this.creeps) {
      this.recycle(creep);
    }
  }

  /**
   * 全部自杀
   * @protected
   */
  protected allSuicide(): void {
    for (const creep of this.creeps) {
      creep.suicide();
    }
  }

  /**
   * 去采集
   * @param creep
   * @protected
   */
  protected toHarvest(creep: Creep): void {
    const sources = creep.room.find(FIND_SOURCES_ACTIVE);
    const bestSource = this.findBestTarget(creep, sources);
    if (bestSource && creep.harvest(bestSource) === ERR_NOT_IN_RANGE) {
      creep.moveTo(bestSource);
    }
  }

  /**
   * 去存货
   * @param creep
   * @protected
   */
  protected toStore(creep: Creep): void {
    const structureTypes = [STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE];
    type StructureType = typeof structureTypes extends [infer T] ? T : never;
    let targets = this.room.find(FIND_STRUCTURES, {
      filter: structure =>
        structureTypes.includes(structure.structureType as StructureType) &&
        (structure as AnyStoreStructure).store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });

    if (targets.length > 0) {
      // 按照 structureTypes 排序
      targets = sortBy(targets, structure => structureTypes.indexOf(structure.structureType as StructureType));
      // 有能存矿的建筑 前去存矿
      if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0]);
      }
    }
  }

  /**
   * 去拿货
   * @param creep
   * @param resourceType
   * @protected
   */
  protected toWithdraw(creep: Creep, resourceType: ResourceConstant = RESOURCE_ENERGY): ScreepsReturnCode {
    const targets = this.room.find(FIND_STRUCTURES, {
      filter: structure =>
        structure.structureType === STRUCTURE_STORAGE &&
        ((structure as AnyStoreStructure).store.getUsedCapacity(resourceType) ?? -1) > 0
    });

    if (targets.length > 0) {
      const withdrawResult = creep.withdraw(targets[0], resourceType);
      if (withdrawResult === ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0]);
      }
      return withdrawResult;
    } else {
      return ERR_NOT_ENOUGH_RESOURCES;
    }
  }

  /**
   * 去集结
   * @param creep
   * @param flag
   * @protected
   */
  protected toMass(creep: Creep, flag = 'Flag'): void {
    const massFlag = this.room.find(FIND_FLAGS, { filter: f => f.name === flag })?.[0];
    if (massFlag) {
      creep.moveTo(massFlag);
    } else {
      creep.say(`没找到${flag}集结点`);
    }
  }
}
