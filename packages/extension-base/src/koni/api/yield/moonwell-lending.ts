// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { YieldPoolInfo } from '@subwallet/extension-base/background/KoniTypes';
import { YIELD_POOL_STAT_REFRESH_INTERVAL } from '@subwallet/extension-base/koni/api/yield/helper/utils';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';

export function subscribeMoonwellLendingStats (chainApi: _SubstrateApi, chainInfoMap: Record<string, _ChainInfo>, poolInfo: YieldPoolInfo, callback: (rs: YieldPoolInfo) => void) {
  function getPoolStat () {
    // eslint-disable-next-line node/no-callback-literal
    callback({
      ...poolInfo,
      stats: {
        isAvailable: false,
        assetEarning: [
          {
            slug: poolInfo.rewardAssets[0],
            apr: -1,
            exchangeRate: -1
          }
        ],
        maxCandidatePerFarmer: 1,
        maxWithdrawalRequestPerFarmer: 1,
        minJoinPool: '50000000000',
        minWithdrawal: '0',
        totalApr: -1,
        tvl: '0'
      }
    });
  }

  function getStatInterval () {
    getPoolStat();
  }

  getStatInterval();

  const interval = setInterval(getStatInterval, YIELD_POOL_STAT_REFRESH_INTERVAL);

  return () => {
    clearInterval(interval);
  };
}
