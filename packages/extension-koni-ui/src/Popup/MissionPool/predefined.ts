// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MissionCategory } from '@subwallet/extension-koni-ui/types/missionPool';

export enum MissionCategoryType {
  ALL='all',
  UPCOMING='upcoming',
  LIVE='live',
  CLAIMABLE='claimable',
  ARCHIVED='archived',
}

export const missionCategoryMap: Record<string, MissionCategory> = {
  [MissionCategoryType.CLAIMABLE]: {
    slug: MissionCategoryType.CLAIMABLE,
    name: 'Claimable'
  },
  [MissionCategoryType.UPCOMING]: {
    slug: MissionCategoryType.UPCOMING,
    name: 'Upcoming'
  },
  [MissionCategoryType.LIVE]: {
    slug: MissionCategoryType.LIVE,
    name: 'Live'
  },
  [MissionCategoryType.ARCHIVED]: {
    slug: MissionCategoryType.ARCHIVED,
    name: 'Archived'
  }
};

export const missionCategories: MissionCategory[] = [
  missionCategoryMap[MissionCategoryType.UPCOMING],
  missionCategoryMap[MissionCategoryType.LIVE],
  missionCategoryMap[MissionCategoryType.CLAIMABLE],
  missionCategoryMap[MissionCategoryType.ARCHIVED]
];
