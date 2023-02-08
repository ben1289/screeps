import { BodyPartPrice } from '../enum';

/**
 * 根据角色获取身体部件列表
 * @param role 角色
 */
export function getBodyPartList(role: CreepRole): BodyPartConstant[][] {
  const roleBodyPart: { [K in CreepRole]: BodyPartConstant[][] } = {
    harvester: [
      [MOVE, WORK, CARRY],
      [MOVE, MOVE, WORK, WORK, CARRY, CARRY],
      [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY]
    ],
    updater: [
      [MOVE, WORK, CARRY],
      [MOVE, MOVE, WORK, WORK, CARRY, CARRY],
      [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY]
    ],
    builder: [
      [MOVE, WORK, CARRY],
      [MOVE, MOVE, WORK, WORK, CARRY, CARRY],
      [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY]
    ],
    repairer: [
      [MOVE, WORK, CARRY],
      [MOVE, MOVE, WORK, WORK, CARRY, CARRY],
      [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY]
    ],
    wallRepairer: [
      [MOVE, WORK, CARRY],
      [MOVE, MOVE, WORK, WORK, CARRY, CARRY],
      [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY]
    ],
    scavenger: [[MOVE, CARRY]]
  };
  return roleBodyPart[role];
}

/**
 * 根据身体部件获取所需的 energy
 * @param body 身体部件
 */
export function getBodyNeedEnergy(body: BodyPartConstant[]): number {
  return _.sum(body.map(b => BodyPartPrice[b]));
}

/**
 * 根据 type 获取房间内 spawn 和 extension 的 energy
 * @param room 房间
 * @param type 总容量 | 可用容量 | 已用容量
 */
export function getEnergyCapacity(room: Room, type: 'getCapacity' | 'getFreeCapacity' | 'getUsedCapacity'): number {
  const spawnsEnergy = room.find(FIND_MY_SPAWNS).map(spawn => spawn.store[type](RESOURCE_ENERGY));
  const extensionsEnergy = room
    .find(FIND_STRUCTURES, {
      filter: structure => structure.structureType === STRUCTURE_EXTENSION
    })
    .map(structure => (structure as StructureExtension).store[type](RESOURCE_ENERGY));
  return _.sum([...spawnsEnergy, ...extensionsEnergy]);
}
