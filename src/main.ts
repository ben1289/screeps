import { ErrorMapper } from 'utils/ErrorMapper';
import Harvester from './creeps/harvester';
import Updater from './creeps/updater';
import Builder from './creeps/builder';
import Repairer from './creeps/repairer';

export const loop = ErrorMapper.wrapLoop(() => {
  for (const roomsKey in Game.rooms) {
    const room = Game.rooms[roomsKey];
    const repairer = new Repairer(room);
    repairer.run();
    const builder = new Builder(room);
    builder.run();
    const updater = new Updater(room);
    updater.run();
    const harvester = new Harvester(room);
    harvester.run();
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
