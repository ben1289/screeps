import Harvester from './creeps/harvester';
import Transporter from './creeps/transporter';
import Updater from './creeps/updater';
import Builder from './creeps/builder';
import Repairer from './creeps/repairer';
import WallRepairer from './creeps/wallRepairer';
import Tower from './structures/tower';
import Link from './structures/link';
import { initRoomStore, myRooms, initSourceStore, initContBySrc } from './store';

export const loop = (): void => {
  initRoomStore();
  initSourceStore();
  initContBySrc();
  for (const myRoom of myRooms) {
    const tower = new Tower(myRoom);
    tower.enableAttack();
    new WallRepairer(myRoom);
    new Repairer(myRoom);
    new Builder(myRoom);
    new Updater(myRoom);
    new Transporter(myRoom);
    new Harvester(myRoom);
    const link = new Link(myRoom);
    link.enableTransfer();
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
