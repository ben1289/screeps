import { orderBy } from 'lodash-es';
import { linkStore } from '../store';

function enableTransfer(): void {
  for (const links of linkStore.nearSource.values()) {
    for (const link of links) {
      if (link.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        const otherLinks = linkStore.other.get(link.room.name) ?? [];
        const targetLink = orderBy(
          otherLinks,
          otherLink => otherLink.store.getFreeCapacity(RESOURCE_ENERGY),
          'desc'
        )[0];
        if (targetLink) {
          link.transferEnergy(targetLink);
        }
      }
    }
  }
}

export default {
  enableTransfer
};
