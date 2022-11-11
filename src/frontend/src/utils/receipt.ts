import moment from 'moment';

import type {
  IAltinnOrgs,
  IApplication,
  IInstance,
  ILanguage,
  IParty,
  ITextResource,
} from 'src/types';

import { getCurrentTaskData } from 'src/utils/applicationMetaDataUtils';
import { getAppOwner, getLanguageFromKey } from 'src/utils/language';

import { getArchiveRef } from './instance';

export const getInstanceMetaDataObject = (
  instance: IInstance,
  party: IParty,
  language: ILanguage,
  organisations: IAltinnOrgs,
  application: IApplication,
  textResources: ITextResource[],
  userLanguage: string,
) => {
  const obj = {} as any;

  if (!instance || !party || !language || !organisations) {
    return obj;
  }

  let dateSubmitted;
  if (instance.data && instance.data.length > 0) {
    let currentTaskData = getCurrentTaskData(application, instance);
    if (currentTaskData !== undefined) {
      const lastChanged = getCurrentTaskData(application, instance).lastChanged;
      dateSubmitted = moment(lastChanged).format('DD.MM.YYYY / HH:mm');
    }
  }

  if (dateSubmitted === undefined && instance.status.isArchived) {
    dateSubmitted = moment(instance.status.archived).format('DD.MM.YYYY / HH:mm');
  }

  obj[getLanguageFromKey('receipt_platform.date_sent', language)] =
    dateSubmitted;
  let sender = '';

  if (party && party.ssn) {
    sender = `${party.ssn}-${party.name}`;
  } else if (party && party.orgNumber) {
    sender = `${party.orgNumber}-${party.name}`;
  }

  obj[getLanguageFromKey('receipt_platform.sender', language)] = sender;
  obj[getLanguageFromKey('receipt_platform.receiver', language)] = getAppOwner(
    textResources,
    organisations,
    instance.org,
    userLanguage,
  );
  obj[getLanguageFromKey('receipt_platform.reference_number', language)] =
    getArchiveRef();

  return obj;
};
