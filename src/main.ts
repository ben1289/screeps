import Harvester from './creeps/harvester';
import Transporter from './creeps/transporter';
import Updater from './creeps/updater';
import Builder from './creeps/builder';
import Repairer from './creeps/repairer';
import WallRepairer from './creeps/wallRepairer';
import Tower from './structures/tower';
import { roomStore } from './store';

export const loop = (): void => {
  roomStore.init();
  for (const myRoom of roomStore.myRooms) {
    const tower = new Tower(myRoom);
    tower.enableAttack();
    new WallRepairer(myRoom);
    new Repairer(myRoom);
    new Builder(myRoom);
    new Updater(myRoom);
    new Transporter(myRoom);
    new Harvester(myRoom);
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
