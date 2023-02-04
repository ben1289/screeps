import { ErrorMapper } from 'utils/ErrorMapper';
import Harvester from './creeps/harvester';
import Upgrader from './creeps/upgrader';

export const loop = ErrorMapper.wrapLoop(() => {
  for (const roomsKey in Game.rooms) {
    const room = Game.rooms[roomsKey];
    const harvester = new Harvester(room);
    harvester.run();
    const upgrader = new Upgrader(room);
    upgrader.run();
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
