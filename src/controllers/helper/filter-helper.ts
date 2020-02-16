import {Filter, Where} from '@loopback/repository';

export function filterClientId(
  currentClientId: number,
  filter?: Filter,
): Filter {
  let filterWithClientId;
  if (filter) {
    if (filter.where) {
      const whereWithClientId = Object.assign({}, filter.where, {
        clientId: currentClientId,
      });
      filterWithClientId = Object.assign({}, filter, {
        where: whereWithClientId,
      });
    } else {
      filterWithClientId = Object.assign({}, filter, {
        where: {clientId: currentClientId},
      });
    }
  } else {
    filterWithClientId = {where: {clientId: currentClientId}};
  }
  return filterWithClientId;
}

export function filterWhere(currentClientId: number, where?: Where): Where {
  return Object.assign({}, where, {clientId: currentClientId});
}
