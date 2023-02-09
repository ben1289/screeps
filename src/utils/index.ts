import { BodyPartPrice } from '../enum';

// 常用身体部件
const commonBody = [
  // 200
  [MOVE, WORK, CARRY],
  // 400
  getBodyArr([2, MOVE], [2, WORK], [2, CARRY]),
  // 600
  getBodyArr([3, MOVE], [3, WORK], [3, CARRY]),
  // 800
  getBodyArr([4, MOVE], [4, WORK], [4, CARRY])
];

/**
 * 根据身体部件数量 获得身体部件数组
 * @param array [数量, 身体部件]...
 */
function getBodyArr(...array: [number, BodyPartConstant][]): BodyPartConstant[] {
  const bodyArr: BodyPartConstant[] = [];
  for (const arr of array) {
    bodyArr.push(..._.fill(Array(arr[0]), arr[1]));
  }
  return bodyArr;
}

/**
 * 根据角色获取身体部件列表
 * @param role 角色
 */
export function getBodyPartList(role: CreepRole): BodyPartConstant[][] {
  /**
   * lv1 300
   * lv2 550
   * lv3 800
   * lv4 1300
   * lv5 1800
   * lv6 2300
   * lv7 5600
   * lv8 12900
   */
  const roleBodyPart: { [K in CreepRole]: BodyPartConstant[][] } = {
    harvester: [
      // 250
      getBodyArr([2, MOVE], [1, WORK], [1, CARRY]),
      // 400
      getBodyArr([3, MOVE], [2, WORK], [1, CARRY]),
      // 750
      getBodyArr([4, MOVE], [4, WORK], [3, CARRY]),
      // 1000
      getBodyArr([5, MOVE], [5, WORK], [5, CARRY])
    ],
    updater: commonBody,
    builder: commonBody,
    repairer: commonBody,
    wallRepairer: commonBody,
    scavenger: [
      [MOVE, CARRY],
      getBodyArr([2, MOVE], [2, CARRY]),
      getBodyArr([3, MOVE], [3, CARRY]),
      getBodyArr([4, MOVE], [4, CARRY])
    ]
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
