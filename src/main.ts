import Harvester from './creeps/harvester';
import Transporter from './creeps/transporter';
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
    new WallRepairer(room);
    new Repairer(room);
    new Builder(room);
    new Updater(room);
    new Transporter(room);
    new Harvester(room);
  }

  for (const name in Memory.rooms) {
    if (!(name in Game.rooms)) {
      delete Memory.rooms[name];
    }
  }

  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
};
