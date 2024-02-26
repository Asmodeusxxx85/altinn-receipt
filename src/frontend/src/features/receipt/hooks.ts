import { useState, useEffect } from 'react';
import Axios, { AxiosResponse } from 'axios';

import type {
  IInstanceContext,
  IDataSources,
  IApplication,
  IInstance,
  IParty,
  IProfile,
  IExtendedInstance,
  ITextResource,
  IAltinnOrgs,
} from 'src/types';

import {
  altinnOrganisationsUrl,
  getApplicationMetadataUrl,
  getUserUrl,
  getExtendedInstanceUrl,
  getTextResourceUrl,
} from 'src/utils/receiptUrlHelper';
import { buildInstanceContext } from 'src/utils/instanceContext';
import { languageLookup, getLanguageFromCode } from 'src/language';
import { replaceTextResourceParams } from 'src/utils/language';

interface IMergeLanguageWithOverrides {
  textResources: ITextResource[];
  instance: IInstance;
  languageCode?: string;
}

const mergeLanguageWithOverrides = ({
  instance,
  textResources,
  languageCode = 'nb',
}: IMergeLanguageWithOverrides) => {
  const originalLanguage = getLanguageFromCode(languageCode);
  const keyPrefix = 'receipt_platform.';
  const instanceContext: IInstanceContext = buildInstanceContext(instance);

  const dataSources: IDataSources = {
    instanceContext,
  };

  const overrides = textResources
    .filter((item) => item.id.startsWith(keyPrefix))
    .map((item) => {
      return {
        ...item,
        unparsedValue: item.value,
      };
    });

  const newTextResources = replaceTextResourceParams(overrides, dataSources);

  const newLanguage = newTextResources.reduce<Record<string, string>>(
    (acc, curr) => {
      const key = curr.id.replace(keyPrefix, '');

      return {
        ...acc,
        [key]: curr.value,
      };
    },
    {},
  );

  return {
    ...originalLanguage.receipt_platform,
    ...newLanguage,
  };
};

interface IUseLanguageWithOverrides {
  textResources?: ITextResource[];
  instance?: IInstance;
  user?: IProfile;
}

export const useLanguageWithOverrides = ({
  textResources,
  instance,
  user,
}: IUseLanguageWithOverrides) => {

  const [language, setLanguage] = useState({
    receipt_platform: getLanguageFromCode(user?.profileSettingPreference.language ?? '').receipt_platform
  });

  useEffect(() => {
    if (user && textResources && instance) {
      try {
        const mergedLanguage = mergeLanguageWithOverrides({
          languageCode: user.profileSettingPreference?.language,
          textResources,
          instance,
        });
        setLanguage({
          receipt_platform: mergedLanguage,
        });
      } catch (error) {
        console.error(error);
      }
    }
  }, [user, instance, textResources]);

  return { language };
};

const cancelSignalMessage = 'canceled';

const logFetchError = (error: any) => {
  if (error?.message !== cancelSignalMessage) {
    console.error(error);
  }
};

export const useFetchInitialData = () => {
  const [party, setParty] = useState<IParty>();
  const [instance, setInstance] = useState<IInstance>();
  const [organisations, setOrganisations] = useState<IAltinnOrgs>();
  const [application, setApplication] = useState<IApplication>();
  const [user, setUser] = useState<IProfile>();
  const [textResources, setTextResources] = useState<ITextResource[]>();

  useEffect(() => {
    const instanceAbortController = new AbortController();
    const orgAbortController = new AbortController();
    const userAbortController = new AbortController();
    const appAbortController = new AbortController();
    const textAbortController = new AbortController();

    const fetchTextResources = async (org: string, app: string, languages: string[]): Promise<{ response: AxiosResponse<any>; language: string; }> => {
      for (const language of languages) {
        try {
          const response = await Axios.get(
            getTextResourceUrl(org, app, language),
            {
              signal: textAbortController.signal,
            },
          );

          if (response.status == 200 && Array.isArray(response.data.resources)) {
            return {
              response: response,
              language: language,
            };
          }
        } catch (error) {
          logFetchError(error);
        }
      }

      // If none of the languages returned a successful response
      logFetchError('Text resources not found for any language');
      return {
        response: {} as AxiosResponse<any>,
        language: languages[0],
      }
    }

    const fetchInitialData = async () => {
      try {
        const [instanceResponse, orgResponse, userResponse] = await Promise.all(
          [
            Axios.get<IExtendedInstance>(getExtendedInstanceUrl(), {
              signal: instanceAbortController.signal,
            }),
            Axios.get(altinnOrganisationsUrl, {
              signal: orgAbortController.signal,
            }),
            Axios.get<IProfile>(getUserUrl(), {
              signal: userAbortController.signal,
            }),
          ],
        );

        const langs = Object.keys(languageLookup).filter(
          element => element !== userResponse.data.profileSettingPreference.language
        ); // Getting all the laguages except the current language
        langs.unshift(userResponse.data.profileSettingPreference.language); // Putting the current language in the beginning.

        const app = instanceResponse.data.instance.appId.split('/')[1];
        const [applicationResponse, appTextResourcesResponse] =
          await Promise.all([
            Axios.get<IApplication>(
              getApplicationMetadataUrl(
                instanceResponse.data.instance.org,
                app,
              ),
              {
                signal: appAbortController.signal,
              },
            ),
            fetchTextResources(instanceResponse.data.instance.org, app, langs),
          ]);

        userResponse.data.profileSettingPreference.language = appTextResourcesResponse.language;
        setApplication(applicationResponse.data);
        setTextResources(appTextResourcesResponse.response.data.resources);
        setParty(instanceResponse.data.party);
        setInstance(instanceResponse.data.instance);
        setOrganisations(orgResponse.data.orgs);
        setUser(userResponse.data);
      } catch (error) {
        logFetchError(error);
      }
    };

    fetchInitialData();

    return () => {
      instanceAbortController.abort();
      orgAbortController.abort();
      userAbortController.abort();
    };
  }, []);

  return {
    application,
    textResources,
    party,
    instance,
    organisations,
    user,
  };
};
