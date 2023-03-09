import { ErrorMapper } from 'utils/ErrorMapper';
import { Harvester, Transporter, Updater, Builder, Repairer, WallRepairer } from './creeps';
import { tower, link } from './structures';
import { initStore, roomStore } from './store';

export const loop = ErrorMapper.wrapLoop(() => {
  initStore();
  for (const room of roomStore.my) {
    new WallRepairer(room);
    new Repairer(room);
    new Builder(room);
    new Updater(room);
    new Transporter(room);
    new Harvester(room);
  }

  tower.enableAttack();
  link.enableTransfer();

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
});
