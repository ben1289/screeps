import { mySource, linksNearSource, otherLinks } from '../store';

export default class Link {
  protected room;

  public constructor(room: Room) {
    this.room = room;
  }

  public enableTransfer(): void {
    const roomName = this.room.name;
    const sources = mySource.get(roomName) ?? [];
    const links = [];
    for (const source of sources) {
      links.push(...(linksNearSource.get(source.id) ?? []));
    }

    for (const link of links) {
      const targetLink = (otherLinks.get(roomName) ?? []).find(
        otherLink => (link.store.getUsedCapacity() ?? 0) <= (otherLink.store.getFreeCapacity() ?? 0)
      );
      if (targetLink) {
        link.transferEnergy(targetLink);
      }
    }
  }
}
