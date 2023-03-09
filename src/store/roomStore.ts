let loadedTick = 0;

let my: Room[] = [];
let other: Room[] = [];

function init(tick = 10): void {
  if (Game.time - loadedTick < tick) return;
  my = [];
  other = [];
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (room.controller?.my) {
      my.push(room);
      if (!room.memory.roleLevel) {
        room.memory.roleLevel = {};
      }
    } else {
      other.push(room);
    }
  }
  loadedTick = Game.time;
}

export { my, other, init };
