interface Memory {
  uuid: number;
  log: any;
}

interface CreepMemory {
  role: string;
  level: number;
  working?: boolean;
  needRenew?: boolean;
}
