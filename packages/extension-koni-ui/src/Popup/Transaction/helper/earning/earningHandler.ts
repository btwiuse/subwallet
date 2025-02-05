// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { NominationPoolInfo, OptimalYieldPath, SubmitJoinNativeStaking, SubmitJoinNominationPool, SubmitYieldStepData, ValidatorInfo, YieldPoolInfo, YieldPoolType, YieldTokenBaseInfo } from '@subwallet/extension-base/background/KoniTypes';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { getYieldNativeStakingValidators, getYieldNominationPools, submitJoinYieldPool, validateYieldProcess } from '@subwallet/extension-koni-ui/messaging';
import { store } from '@subwallet/extension-koni-ui/stores';

export function fetchEarningChainValidators (
  poolInfo: YieldPoolInfo,
  unmount: boolean,
  setPoolLoading: (value: boolean) => void,
  setValidatorLoading: (value: boolean) => void,
  setForceFetchValidator: (value: boolean) => void
) {
  if (!unmount) {
    let promise;

    if (poolInfo.type === YieldPoolType.NATIVE_STAKING) {
      promise = getYieldNativeStakingValidators(poolInfo);
    } else {
      promise = getYieldNominationPools(poolInfo);
    }

    setValidatorLoading(true);
    promise
      .then((result) => {
        if (poolInfo.type === YieldPoolType.NATIVE_STAKING) {
          store.dispatch({ type: 'bonding/updateChainValidators', payload: { chain: poolInfo.chain, validators: result as ValidatorInfo[] } });
        } else {
          store.dispatch({ type: 'bonding/updateNominationPools', payload: { chain: poolInfo.chain, pools: result as NominationPoolInfo[] } });
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!unmount) {
          if (poolInfo.type === YieldPoolType.NATIVE_STAKING) {
            setValidatorLoading(false);
          } else {
            setPoolLoading(false);
          }

          setForceFetchValidator(false);
        }
      });
  }
}

export async function handleYieldStep (
  address: string,
  yieldPoolInfo: YieldPoolInfo,
  path: OptimalYieldPath,
  currentStep: number,
  data: SubmitYieldStepData | SubmitJoinNativeStaking | SubmitJoinNominationPool
): Promise<SWTransactionResponse> {
  return submitJoinYieldPool({
    address,
    path: path,
    yieldPoolInfo,
    currentStep,
    data
  });
}

export function getJoinYieldParams (yieldPoolInfo: YieldPoolInfo, amount: string, feeStructure: YieldTokenBaseInfo): SubmitYieldStepData {
  // @ts-ignore
  const exchangeRate = yieldPoolInfo?.stats?.assetEarning[0]?.exchangeRate || 0;

  return {
    slug: yieldPoolInfo.slug,
    exchangeRate,
    inputTokenSlug: yieldPoolInfo.inputAssets[0],
    derivativeTokenSlug: yieldPoolInfo?.derivativeAssets ? yieldPoolInfo.derivativeAssets[0] : undefined, // TODO
    rewardTokenSlug: yieldPoolInfo.rewardAssets[0],
    amount,
    feeTokenSlug: feeStructure.slug
  };
}

export async function handleValidateYield (
  address: string,
  yieldPoolInfo: YieldPoolInfo,
  path: OptimalYieldPath,
  amount: string,
  data: SubmitYieldStepData | SubmitJoinNativeStaking | SubmitJoinNominationPool
): Promise<TransactionError[]> {
  return validateYieldProcess({
    address,
    path: path,
    yieldPoolInfo,
    data,
    amount
  });
}
