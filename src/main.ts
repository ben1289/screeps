import Harvester from './creeps/harvester';
import Updater from './creeps/updater';
import Builder from './creeps/builder';
import Repairer from './creeps/repairer';
import WallRepairer from './creeps/wallRepairer';
import Tower from './structures/tower';

export const loop = (): void => {
  for (const roomsKey in Game.rooms) {
    const room = Game.rooms[roomsKey];
    if (!room.memory.roleLevel) {
      room.memory.roleLevel = {};
    }
    const tower = new Tower(room);
    tower.enableAttack();
    const wallRepairer = new WallRepairer(room, 1);
    wallRepairer.run();
    const repairer = new Repairer(room, 1);
    repairer.run();
    const builder = new Builder(room, 1);
    builder.run();
    const updater = new Updater(room);
    updater.run();
    const harvester = new Harvester(room, 4);
    harvester.run();
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
};
