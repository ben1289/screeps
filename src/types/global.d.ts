interface Memory {
  uuid: number;
  log: any;
}

interface RoomMemory {
  roleLevel: { [K in CreepRole]?: number };
  sourceContainer: { sourceId: string; containerId: string }[];
}

interface CreepMemory {
  role: CreepRole;
  level: number;
  working?: boolean;
  needRenew?: boolean;
}

type CreepRole = 'harvester' | 'transporter' | 'updater' | 'builder' | 'repairer' | 'wallRepairer' | 'scavenger';
