import { http } from 'msw';
import { setupServer } from 'msw/node';

import {
  instance,
  altinnOrgs,
  currentUser,
  application,
  texts,
} from './apiResponses';

export const mockLocation = (location: object = {}) => {
  jest.spyOn(window, 'location', 'get').mockReturnValue({
    ...window.location,
    ...location,
  });
};

export const instanceHandler = (response: any) => {
  return http.get(
    'https://platform.at21.altinn.cloud/receipt/api/v1/instances/mockInstanceOwnerId/6697de17-18c7-4fb9-a428-d6a414a797ae',
    () => new Response(JSON.stringify(response)),
  );
};

export const textsHandler = (response: any) => {
  return http.get(
    'https://localhost/storage/api/v1/applications/ttd/frontend-test/texts/nb',
    () => new Response(JSON.stringify(response)),
  );
};

export const handlers: any = [
  instanceHandler(instance),
  textsHandler(texts),

  http.get('https://altinncdn.no/orgs/altinn-orgs.json', () => new Response(JSON.stringify(altinnOrgs))),
  http.get('https://localhost/receipt/api/v1/users/current', () => new Response(JSON.stringify(currentUser))),
  http.get('https://platform.at21.altinn.cloud/storage/api/v1/applications/ttd/frontend-test',
    () => new Response(JSON.stringify(application)),
  ),
];

export { setupServer };
