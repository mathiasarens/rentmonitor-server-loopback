import { Filter } from "@loopback/repository";

export function filterClientId(currentClientId: number, filter?: Filter): Filter {
  let filterWithClientId;
  if (filter) {
    if (filter.where) {
      const whereWithoutClientId = Object.keys(filter.where)
        .filter(key => key !== "clientId")
        .reduce((acc, cur) => ({ ...acc, cur }), {})
      const whereWithClientId = Object.assign({}, whereWithoutClientId, {
        clientId: currentClientId
      })
      filterWithClientId = Object.assign({}, filter, {
        where: whereWithClientId,
      })
    } else {
      filterWithClientId = Object.assign({}, filter, {
        where: { clientId: currentClientId },
      })
    }
  } else {
    filterWithClientId = { where: { clientId: currentClientId } }
  }
  return filterWithClientId;
};
