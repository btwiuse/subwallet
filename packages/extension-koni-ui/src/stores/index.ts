// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { configureStore } from '@reduxjs/toolkit/dist';

import AllAccountReducer from './AllAccount';
import AssetRegistryReducer from './AssetRegistry';
import AuthUrlReducer from './AuthUrl';
import BalanceReducer from './Balance';
import BondingParamsReducer from './BondingParams';
import ChainInfoMapReducer from './ChainInfoMap';
import ChainRegistryReducer from './ChainRegistry';
import ChainStateMapReducer from './ChainStateMap';
import CrowdloanReducer from './Crowdloan';
import CurrentAccountReducer from './CurrentAccount';
import CurrentNetworkReducer from './CurrentNetwork';
import CustomTokenReducer from './CustomToken';
import KeyringStateReducer from './KeyringState';
import NetworkConfigParamsReducer from './NetworkConfigParams';
import NetworkMapReducer from './NetworkMap';
import NftReducer from './Nft';
import NftCollectionReducer from './NftCollection';
import PriceReducer from './Price';
import SettingsReducer from './Settings';
import stakeCompoundParamsReducer from './StakeCompound';
import StakeUnlockingReducer from './StakeUnlockingInfo';
import StakingReducer from './Staking';
import StakingRewardReducer from './StakingReward';
import TokenConfigReducer from './TokenConfigParams';
import TransactionHistoryReducer from './TransactionHistory';
import TransferNftExtraReducer from './TransferNftExtra';
import TransferNftParamsReducer from './TransferNftParams';
import UnbondingParamsReducer from './UnbondingParams';

const reducers = {
  // tx history
  transactionHistory: TransactionHistoryReducer,

  // crowdloan
  crowdloan: CrowdloanReducer,

  // nft
  nftCollection: NftCollectionReducer,
  nft: NftReducer,
  transferNftExtra: TransferNftExtraReducer,
  transferNftParams: TransferNftParamsReducer,

  // staking
  stakingReward: StakingRewardReducer,
  staking: StakingReducer,
  stakeCompoundParams: stakeCompoundParamsReducer,
  stakeUnlockingInfo: StakeUnlockingReducer,
  unbondingParams: UnbondingParamsReducer,
  bondingParams: BondingParamsReducer,

  // custom network, custom token
  networkConfigParams: NetworkConfigParamsReducer,
  tokenConfigParams: TokenConfigReducer,
  customToken: CustomTokenReducer,

  // balance
  price: PriceReducer,
  balance: BalanceReducer,

  // deprecated
  networkMap: NetworkMapReducer,
  chainRegistry: ChainRegistryReducer,

  // general stores
  chainInfoMap: ChainInfoMapReducer,
  chainStateMap: ChainStateMapReducer,
  assetRegistry: AssetRegistryReducer,

  currentAccount: CurrentAccountReducer,
  currentNetwork: CurrentNetworkReducer,
  allAccount: AllAccountReducer,
  settings: SettingsReducer,
  authUrl: AuthUrlReducer,
  keyringState: KeyringStateReducer
};

export const store = configureStore({
  devTools: process.env.NODE_ENV !== 'production',
  reducer: reducers
});

export type RootState = ReturnType<typeof store.getState>
export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
