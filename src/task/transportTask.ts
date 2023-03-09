interface TransportTask {
  tick: Game['time'];
  type: 'toStore';
  room: Room;
  target: Structure;
}

const taskQueue: TransportTask[] = [];

function releaseTask(type: 'toStore', target: Structure, urgent = false): void {
  const task = {
    tick: Game.time,
    room: target.room,
    type,
    target
  };
  const creeps = task.room.find(FIND_MY_CREEPS, { filter: creep => creep.memory.role === 'transporter' });
  if (urgent) {
    taskQueue.unshift(task);
  } else {
    taskQueue.push(task);
  }
}

export default {
  releaseTask
};
