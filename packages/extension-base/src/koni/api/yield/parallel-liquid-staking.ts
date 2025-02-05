// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { ExtrinsicType, OptimalYieldPath, OptimalYieldPathParams, RequestCrossChainTransfer, RequestYieldStepSubmit, SubmitYieldStepData, YieldPoolInfo, YieldPositionInfo, YieldPositionStats, YieldStepType } from '@subwallet/extension-base/background/KoniTypes';
import { PalletStakingStakingLedger } from '@subwallet/extension-base/koni/api/staking/bonding/relayChain';
import { createXcmExtrinsic } from '@subwallet/extension-base/koni/api/xcm';
import { convertDerivativeToOriginToken, YIELD_POOL_MIN_AMOUNT_PERCENT, YIELD_POOL_STAT_REFRESH_INTERVAL } from '@subwallet/extension-base/koni/api/yield/helper/utils';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getChainNativeTokenSlug, _getTokenOnChainAssetId } from '@subwallet/extension-base/services/chain-service/utils';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { BN, BN_ZERO } from '@polkadot/util';

interface BlockHeader {
  number: number
}

export function subscribeParallelLiquidStakingStats (chainApi: _SubstrateApi, poolInfo: YieldPoolInfo, callback: (rs: YieldPoolInfo) => void) {
  async function getPoolStat () {
    const substrateApi = await chainApi.isReady;

    const [_exchangeRate, _currentBlockHeader, _currentTimestamp, _stakingLedgers] = await Promise.all([
      substrateApi.api.query.liquidStaking.exchangeRate(),
      substrateApi.api.rpc.chain.getHeader(),
      substrateApi.api.query.timestamp.now(),
      substrateApi.api.query.liquidStaking.stakingLedgers.entries()
    ]);

    let tvl = BN_ZERO;

    for (const _stakingLedger of _stakingLedgers) {
      const _ledger = _stakingLedger[1];
      const ledger = _ledger.toPrimitive() as unknown as PalletStakingStakingLedger;

      tvl = tvl.add(new BN(ledger.total.toString()));
    }

    const exchangeRate = _exchangeRate.toPrimitive() as number;
    const currentBlockHeader = _currentBlockHeader.toPrimitive() as unknown as BlockHeader;
    const currentTimestamp = _currentTimestamp.toPrimitive() as number;

    const beginBlock = currentBlockHeader.number - ((24 * 60 * 60) / 6) * 14;
    const _beginBlockHash = await substrateApi.api.rpc.chain.getBlockHash(beginBlock);
    const beginBlockHash = _beginBlockHash.toString();

    const [_beginTimestamp, _beginExchangeRate] = await Promise.all([
      substrateApi.api.query.timestamp.now.at(beginBlockHash),
      substrateApi.api.query.liquidStaking.exchangeRate.at(beginBlockHash)
    ]);

    const beginTimestamp = _beginTimestamp.toPrimitive() as number;
    const beginExchangeRate = _beginExchangeRate.toPrimitive() as number;
    const decimals = 10 ** 18;

    const apy = (exchangeRate / beginExchangeRate) ** (365 * 24 * 60 * 60000 / (currentTimestamp - beginTimestamp)) - 1;

    // eslint-disable-next-line node/no-callback-literal
    callback({
      ...poolInfo,
      stats: {
        assetEarning: [
          {
            slug: poolInfo.rewardAssets[0],
            apy: apy * 100,
            exchangeRate: exchangeRate / decimals
          }
        ],
        maxCandidatePerFarmer: 1,
        maxWithdrawalRequestPerFarmer: 1,
        minJoinPool: '10000000000',
        minWithdrawal: '5000000000',
        totalApy: apy * 100,
        tvl: tvl.toString()
      }
    });
  }

  function getStatInterval () {
    getPoolStat().catch(console.error);
  }

  getStatInterval();

  const interval = setInterval(getStatInterval, YIELD_POOL_STAT_REFRESH_INTERVAL);

  return () => {
    clearInterval(interval);
  };
}

export function getParallelLiquidStakingPosition (substrateApi: _SubstrateApi, useAddresses: string[], chainInfo: _ChainInfo, poolInfo: YieldPoolInfo, assetInfoMap: Record<string, _ChainAsset>, positionCallback: (rs: YieldPositionInfo) => void) {
  // @ts-ignore
  const derivativeTokenSlug = poolInfo.derivativeAssets[0];
  const derivativeTokenInfo = assetInfoMap[derivativeTokenSlug];

  return substrateApi.api.query.assets.account.multi(useAddresses.map((address) => [_getTokenOnChainAssetId(derivativeTokenInfo), address]), (balances) => {
    for (let i = 0; i < balances.length; i++) {
      const b = balances[i];
      const address = useAddresses[i];
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
      const bdata = b?.toHuman();

      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      const addressBalance = bdata && bdata.balance ? new BN(String(bdata?.balance).replaceAll(',', '') || '0') : BN_ZERO;

      positionCallback({
        slug: poolInfo.slug,
        chain: chainInfo.slug,
        address,
        balance: [
          {
            slug: derivativeTokenSlug, // token slug
            totalBalance: addressBalance.toString(),
            activeBalance: addressBalance.toString()
          }
        ],

        metadata: {
          rewards: []
        } as YieldPositionStats
      } as YieldPositionInfo);
    }
  });
}

export async function getParallelLiquidStakingExtrinsic (address: string, params: OptimalYieldPathParams, path: OptimalYieldPath, currentStep: number, requestData: RequestYieldStepSubmit, balanceService: BalanceService) {
  const inputData = requestData.data as SubmitYieldStepData;

  if (path.steps[currentStep].type === YieldStepType.XCM) {
    const destinationTokenSlug = params.poolInfo.inputAssets[0];
    const originChainInfo = params.chainInfoMap[COMMON_CHAIN_SLUGS.POLKADOT];
    const originTokenSlug = _getChainNativeTokenSlug(originChainInfo);
    const originTokenInfo = params.assetInfoMap[originTokenSlug];
    const destinationTokenInfo = params.assetInfoMap[destinationTokenSlug];
    const substrateApi = params.substrateApiMap[originChainInfo.slug];

    const inputTokenBalance = await balanceService.getTokenFreeBalance(params.address, destinationTokenInfo.originChain, destinationTokenSlug);
    const bnInputTokenBalance = new BN(inputTokenBalance.value);

    const xcmFee = path.totalFee[currentStep].amount || '0';
    const bnXcmFee = new BN(xcmFee);
    const bnAmount = new BN(inputData.amount);

    const bnTotalAmount = bnAmount.sub(bnInputTokenBalance).add(bnXcmFee);

    const extrinsic = await createXcmExtrinsic({
      chainInfoMap: params.chainInfoMap,
      destinationTokenInfo,
      originTokenInfo,
      recipient: address,
      sendingValue: bnTotalAmount.toString(),
      substrateApi
    });

    const xcmData: RequestCrossChainTransfer = {
      originNetworkKey: originChainInfo.slug,
      destinationNetworkKey: destinationTokenInfo.originChain,
      from: address,
      to: address,
      value: bnTotalAmount.toString(),
      tokenSlug: originTokenSlug,
      showExtraWarning: true
    };

    return {
      txChain: originChainInfo.slug,
      extrinsicType: ExtrinsicType.TRANSFER_XCM,
      extrinsic,
      txData: xcmData,
      transferNativeAmount: bnTotalAmount.toString()
    };
  }

  const substrateApi = await params.substrateApiMap[params.poolInfo.chain].isReady;
  const extrinsic = substrateApi.api.tx.liquidStaking.stake(inputData.amount);

  return {
    txChain: params.poolInfo.chain,
    extrinsicType: ExtrinsicType.MINT_SDOT,
    extrinsic,
    txData: requestData,
    transferNativeAmount: '0'
  };
}

export async function getParallelLiquidStakingRedeem (params: OptimalYieldPathParams, amount: string, address: string): Promise<[ExtrinsicType, SubmittableExtrinsic<'promise'>]> {
  const substrateApi = await params.substrateApiMap[params.poolInfo.chain].isReady;

  const derivativeTokenSlug = params.poolInfo.derivativeAssets?.[0] || '';
  const originTokenSlug = params.poolInfo.inputAssets[0] || '';

  const derivativeTokenInfo = params.assetInfoMap[derivativeTokenSlug];
  const originTokenInfo = params.assetInfoMap[originTokenSlug];

  const formattedMinAmount = convertDerivativeToOriginToken(amount, params.poolInfo, derivativeTokenInfo, originTokenInfo);
  const weightedMinAmount = Math.floor(YIELD_POOL_MIN_AMOUNT_PERCENT[params.poolInfo.slug] * formattedMinAmount);

  const extrinsic = substrateApi.api.tx.ammRoute.swapExactTokensForTokens(['1001', '101'], amount, weightedMinAmount);

  return [ExtrinsicType.REDEEM_SDOT, extrinsic];
}
