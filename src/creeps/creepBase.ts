import { getBodyPartList } from '../utils';

export default class CreepBase {
  private readonly role;
  protected room;
  protected spawns;
  protected readonly creeps;

  public constructor(room: Room, role: CreepRole, maximum: number) {
    this.role = role;
    this.room = room;
    this.spawns = room.find(FIND_MY_SPAWNS);
    this.creeps = room.find(FIND_MY_CREEPS, { filter: creep => creep.memory.role === role });
    this.generate(maximum);
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
   * @private
   */
  private generate(maximum: number): void {
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
          this.spawnCreep(spawn, curLevel);
        } else if (this.creeps.length === maximum) {
          // 如果刚刚满员 则判断有无低等级 creep 有则生成 creep
          if (this.creeps.findIndex(creep => creep.memory.level < curLevel) !== -1) {
            this.spawnCreep(spawn, curLevel);
          }
        } else {
          // 如果超员 则将冗余的 creep 杀掉
          const overflowNum = this.creeps.length - maximum;
          const creeps = _.sortBy(this.creeps, creep => creep.memory.level, 'ticksToLive');
          for (let i = 0; i < overflowNum; i++) {
            const bestSpawn = this.findBestSpawn(creeps[i]);
            if (bestSpawn?.recycleCreep(creeps[i]) === ERR_NOT_IN_RANGE) {
              creeps[i].moveTo(bestSpawn);
            }
          }
        }
      }
    }
  }

  /**
   * 寻找最近的 spawn
   * @param creep
   * @protected
   */
  protected findBestSpawn(creep: Creep): StructureSpawn | null {
    if (this.spawns.length === 1) {
      return this.spawns[0];
    } else if (this.spawns.length > 1) {
      return _.sortBy(this.spawns, spawn => spawn.room.findPath(creep.pos, spawn.pos).length)[0];
    } else {
      return null;
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
      const bestSpawn = this.findBestSpawn(creep);
      if (bestSpawn) {
        const renewResult = bestSpawn.renewCreep(creep);
        if (renewResult === OK) {
          return true;
        }
        if (renewResult === ERR_NOT_IN_RANGE) {
          creep.moveTo(bestSpawn, { visualizePathStyle: { stroke: '#19ff00' } });
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 采集
   * @param creep
   * @protected
   */
  protected toHarvest(creep: Creep): void {
    const sources = creep.room.find(FIND_SOURCES_ACTIVE);
    const goals = _.map(sources, source => ({ pos: source.pos, range: 1 }));
    const ret = PathFinder.search(creep.pos, goals, {
      plainCost: 2,
      swampCost: 10,
      roomCallback(roomName): boolean | CostMatrix {
        const room = Game.rooms[roomName];
        if (!room) return false;

        if (room.memory.costs?.length > 0) {
          return PathFinder.CostMatrix.deserialize(room.memory.costs);
        }

        const costs = new PathFinder.CostMatrix();

        room.find(FIND_STRUCTURES).forEach(function (struct) {
          if (struct.structureType === STRUCTURE_ROAD) {
            // 寻路时将倾向于道路
            costs.set(struct.pos.x, struct.pos.y, 1);
          } else if (
            struct.structureType !== STRUCTURE_CONTAINER &&
            (struct.structureType !== STRUCTURE_RAMPART || !struct.my)
          ) {
            // 不能穿过无法行走的建筑
            costs.set(struct.pos.x, struct.pos.y, 0xff);
          }
        });

        // 躲避房间中的 creep
        room.find(FIND_CREEPS).forEach(c => {
          costs.set(c.pos.x, c.pos.y, 0xff);
        });

        room.memory.costs = costs.serialize();
        return costs;
      }
    });

    const pos = ret.path[0];
    if (pos) {
      creep.move(creep.pos.getDirectionTo(pos));
    } else {
      for (const source of sources) {
        creep.harvest(source);
      }
    }
  }

  /**
   * 存储
   * @param creep
   * @param location
   * @protected
   */
  protected toStore(creep: Creep, location = 'flag'): void {
    type StructureTypes = StructureExtension | StructureSpawn | StructureContainer | StructureTower | StructureStorage;
    const structureTypes = [
      STRUCTURE_EXTENSION,
      STRUCTURE_SPAWN,
      STRUCTURE_CONTAINER,
      STRUCTURE_TOWER,
      STRUCTURE_STORAGE
    ];
    let targets = this.room.find(FIND_STRUCTURES, {
      filter: (structure: StructureTypes) =>
        structureTypes.includes(structure.structureType) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });
    // 按照 structureTypes 排序
    targets = _.sortBy(targets, (structure: StructureTypes) => structureTypes.indexOf(structure.structureType));

    if (targets.length > 0) {
      // 有能存矿的建筑 前去存矿
      if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#fde36c' } });
      }
    } else {
      // 没有能存矿的建筑 前去集结点等待
      const collectFlag = this.room.find(FIND_FLAGS, { filter: flag => flag.name === location })?.[0];
      if (collectFlag) {
        creep.moveTo(collectFlag, { visualizePathStyle: { stroke: '#ffffff' } });
      } else {
        creep.say(`没找到 ${location}`);
      }
    }
  }
}
