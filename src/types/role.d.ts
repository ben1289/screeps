type Harvester = 'harvester';
type Updater = 'updater';
type Builder = 'builder';
type Repairer = 'repairer';
type WallRepairer = 'wallRepairer';
type Scavenger = 'scavenger';

type CreepRole = Harvester | Updater | Builder | Repairer | WallRepairer | Scavenger;

declare const roleHarvester: Harvester;
declare const roleUpdater: Updater;
declare const roleBuilder: Builder;
declare const roleRepairer: Repairer;
declare const roleWallRepairer: WallRepairer;
declare const roleScavenger: Scavenger;
