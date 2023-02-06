interface Memory {
  uuid: number;
  log: any;
}

interface RoomMemory {
  creepLevel: number;
}

type CreepRole = 'harvester' | 'updater' | 'builder' | 'repairer';

interface CreepMemory {
  role: CreepRole;
  level: number;
  working?: boolean;
  needRenew?: boolean;
}
