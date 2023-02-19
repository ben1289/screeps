export let myRooms: Room[] = [];
export let publicRooms: Room[] = [];

export function init(): void {
  myRooms = [];
  publicRooms = [];
  for (const name in Game.rooms) {
    const room = Game.rooms[name];
    if (room.controller?.my) {
      myRooms.push(room);
      if (!room.memory.roleLevel) {
        room.memory.roleLevel = {};
      }
    } else {
      publicRooms.push(room);
    }
  }
}
