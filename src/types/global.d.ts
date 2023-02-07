interface Memory {
  uuid: number;
  log: any;
}

type CreepRole = 'harvester' | 'updater' | 'builder' | 'repairer' | 'scavenger';

interface RoomMemory {
  roleLevel: { [K in CreepRole]?: number };
}

interface CreepMemory {
  role: CreepRole;
  level: number;
  working?: boolean;
  needRenew?: boolean;
}
