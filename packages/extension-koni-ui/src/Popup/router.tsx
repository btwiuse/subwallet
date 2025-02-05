// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PHISHING_PAGE_REDIRECT } from '@subwallet/extension-base/defaults';
import { PageWrapper } from '@subwallet/extension-koni-ui/components';
import ErrorFallback from '@subwallet/extension-koni-ui/Popup/ErrorFallback';
import { Root } from '@subwallet/extension-koni-ui/Popup/Root';
import { i18nPromise } from '@subwallet/extension-koni-ui/utils';
import React, { ComponentType } from 'react';
import { createBrowserRouter, IndexRouteObject, Outlet, useLocation, useOutletContext } from 'react-router-dom';

export const lazyLoaderMap: Record<string, LazyLoader> = {};

export class LazyLoader {
  private elemLoader;
  private loadPromise: Promise<ComponentType<any>> | undefined;

  constructor (key: string, promiseFunction: () => Promise<{ default: ComponentType<any> }>) {
    this.elemLoader = promiseFunction;
    lazyLoaderMap[key] = this;
  }

  public loadElement () {
    if (!this.loadPromise) {
      this.loadPromise = new Promise<ComponentType<any>>((resolve, reject) => {
        this.elemLoader().then((module) => {
          resolve(module.default);
        }).catch(reject);
      });
    }

    return this.loadPromise;
  }

  public generateRouterObject (path: string, preload = false): Pick<IndexRouteObject, 'path' | 'lazy'> {
    if (preload) {
      this.loadElement().catch(console.error);
    }

    return {
      path,
      lazy: async () => {
        const Element = await this.loadElement();

        return {
          element: <Element />
        };
      }
    };
  }
}

const PhishingDetected = new LazyLoader('PhishingDetected', () => import('@subwallet/extension-koni-ui/Popup/PhishingDetected'));
const Welcome = new LazyLoader('Welcome', () => import('@subwallet/extension-koni-ui/Popup/Welcome'));
const CreateDone = new LazyLoader('CreateDone', () => import('@subwallet/extension-koni-ui/Popup/CreateDone'));
const BuyTokens = new LazyLoader('BuyTokens', () => import('@subwallet/extension-koni-ui/Popup/BuyTokens'));
const Staking = new LazyLoader('Staking', () => import('@subwallet/extension-koni-ui/Popup/Home/Staking'));

const Tokens = new LazyLoader('Tokens', () => import('@subwallet/extension-koni-ui/Popup/Home/Tokens'));
const TokenDetailList = new LazyLoader('TokenDetailList', () => import('@subwallet/extension-koni-ui/Popup/Home/Tokens/DetailList'));

const NftItemDetail = new LazyLoader('NftItemDetail', () => import('@subwallet/extension-koni-ui/Popup/Home/Nfts/NftItemDetail'));
const NftCollections = new LazyLoader('NftCollections', () => import('@subwallet/extension-koni-ui/Popup/Home/Nfts/NftCollections'));
const NftCollectionDetail = new LazyLoader('NftCollectionDetail', () => import('@subwallet/extension-koni-ui/Popup/Home/Nfts/NftCollectionDetail'));
const NftImport = new LazyLoader('NftImport', () => import('@subwallet/extension-koni-ui/Popup/Home/Nfts/NftImport'));

const History = new LazyLoader('History', () => import('@subwallet/extension-koni-ui/Popup/Home/History'));
const Crowdloans = new LazyLoader('Crowdloans', () => import('@subwallet/extension-koni-ui/Popup/Home/Crowdloans'));
const Home = new LazyLoader('Home', () => import('@subwallet/extension-koni-ui/Popup/Home'));
const Statistics = new LazyLoader('Statistics', () => import('@subwallet/extension-koni-ui/Popup/Home/Statistics'));

const Settings = new LazyLoader('Settings', () => import('@subwallet/extension-koni-ui/Popup/Settings'));
const GeneralSetting = new LazyLoader('GeneralSetting', () => import('@subwallet/extension-koni-ui/Popup/Settings/GeneralSetting'));
const ManageAddressBook = new LazyLoader('ManageAddressBook', () => import('@subwallet/extension-koni-ui/Popup/Settings/AddressBook'));

const ManageChains = new LazyLoader('ManageChains', () => import('@subwallet/extension-koni-ui/Popup/Settings/Chains/ManageChains'));
const ChainImport = new LazyLoader('ChainImport', () => import('@subwallet/extension-koni-ui/Popup/Settings/Chains/ChainImport'));
const AddProvider = new LazyLoader('AddProvider', () => import('@subwallet/extension-koni-ui/Popup/Settings/Chains/AddProvider'));
const ChainDetail = new LazyLoader('ChainDetail', () => import('@subwallet/extension-koni-ui/Popup/Settings/Chains/ChainDetail'));

const ManageTokens = new LazyLoader('ManageTokens', () => import('@subwallet/extension-koni-ui/Popup/Settings/Tokens/ManageTokens'));
const FungibleTokenImport = new LazyLoader('FungibleTokenImport', () => import('@subwallet/extension-koni-ui/Popup/Settings/Tokens/FungibleTokenImport'));
const TokenDetail = new LazyLoader('TokenDetail', () => import('@subwallet/extension-koni-ui/Popup/Settings/Tokens/TokenDetail'));

const SecurityList = new LazyLoader('SecurityList', () => import('@subwallet/extension-koni-ui/Popup/Settings/Security'));
const ManageWebsiteAccess = new LazyLoader('ManageWebsiteAccess', () => import('@subwallet/extension-koni-ui/Popup/Settings/Security/ManageWebsiteAccess'));
const ManageWebsiteAccessDetail = new LazyLoader('ManageWebsiteAccessDetail', () => import('@subwallet/extension-koni-ui/Popup/Settings/Security/ManageWebsiteAccess/Detail'));

const NewSeedPhrase = new LazyLoader('NewSeedPhrase', () => import('@subwallet/extension-koni-ui/Popup/Account/NewSeedPhrase'));
const ImportSeedPhrase = new LazyLoader('ImportSeedPhrase', () => import('@subwallet/extension-koni-ui/Popup/Account/ImportSeedPhrase'));
const ImportPrivateKey = new LazyLoader('ImportPrivateKey', () => import('@subwallet/extension-koni-ui/Popup/Account/ImportPrivateKey'));
const RestoreJson = new LazyLoader('RestoreJson', () => import('@subwallet/extension-koni-ui/Popup/Account/RestoreJson'));
const ImportQrCode = new LazyLoader('ImportQrCode', () => import('@subwallet/extension-koni-ui/Popup/Account/ImportQrCode'));
const AttachReadOnly = new LazyLoader('AttachReadOnly', () => import('@subwallet/extension-koni-ui/Popup/Account/AttachReadOnly'));
const ConnectPolkadotVault = new LazyLoader('ConnectPolkadotVault', () => import('@subwallet/extension-koni-ui/Popup/Account/ConnectQrSigner/ConnectPolkadotVault'));
const ConnectKeystone = new LazyLoader('ConnectKeystone', () => import('@subwallet/extension-koni-ui/Popup/Account/ConnectQrSigner/ConnectKeystone'));
const ConnectLedger = new LazyLoader('ConnectLedger', () => import('@subwallet/extension-koni-ui/Popup/Account/ConnectLedger'));

const Login = new LazyLoader('Login', () => import('@subwallet/extension-koni-ui/Popup/Keyring/Login'));
const CreatePassword = new LazyLoader('CreatePassword', () => import('@subwallet/extension-koni-ui/Popup/Keyring/CreatePassword'));
const ChangePassword = new LazyLoader('ChangePassword', () => import('@subwallet/extension-koni-ui/Popup/Keyring/ChangePassword'));
const ApplyMasterPassword = new LazyLoader('ApplyMasterPassword', () => import('@subwallet/extension-koni-ui/Popup/Keyring/ApplyMasterPassword'));

const AccountDetail = new LazyLoader('AccountDetail', () => import('@subwallet/extension-koni-ui/Popup/Account/AccountDetail'));
const AccountExport = new LazyLoader('AccountExport', () => import('@subwallet/extension-koni-ui/Popup/Account/AccountExport'));

const Transaction = new LazyLoader('Transaction', () => import('@subwallet/extension-koni-ui/Popup/Transaction/Transaction'));
const TransactionDone = new LazyLoader('TransactionDone', () => import('@subwallet/extension-koni-ui/Popup/TransactionDone'));
const SendFund = new LazyLoader('SendFund', () => import('@subwallet/extension-koni-ui/Popup/Transaction/variants/SendFund'));
const SendNFT = new LazyLoader('SendNFT', () => import('@subwallet/extension-koni-ui/Popup/Transaction/variants/SendNFT'));
const Stake = new LazyLoader('Stake', () => import('@subwallet/extension-koni-ui/Popup/Transaction/variants/Stake/Stake'));
const Unstake = new LazyLoader('Unstake', () => import('@subwallet/extension-koni-ui/Popup/Transaction/variants/Stake/Unbond'));
const CancelUnstake = new LazyLoader('CancelUnstake', () => import('@subwallet/extension-koni-ui/Popup/Transaction/variants/Stake/CancelUnstake'));
const ClaimReward = new LazyLoader('ClaimReward', () => import('@subwallet/extension-koni-ui/Popup/Transaction/variants/Stake/ClaimReward'));
const Withdraw = new LazyLoader('Withdraw', () => import('@subwallet/extension-koni-ui/Popup/Transaction/variants/Stake/Withdraw'));
const Earn = new LazyLoader('Earn', () => import('@subwallet/extension-koni-ui/Popup/Transaction/variants/Yield/Earn'));
const UnYield = new LazyLoader('YieldUnstake', () => import('@subwallet/extension-koni-ui/Popup/Transaction/variants/Yield/YieldUnstake'));
const WithdrawYield = new LazyLoader('YieldWithdraw', () => import('@subwallet/extension-koni-ui/Popup/Transaction/variants/Yield/YieldWithdraw'));
const CancelUnYield = new LazyLoader('YieldCancelUnstake', () => import('@subwallet/extension-koni-ui/Popup/Transaction/variants/Yield/YieldCancelUnstake'));
const YieldWithdrawPosition = new LazyLoader('YieldWithdrawPosition', () => import('@subwallet/extension-koni-ui/Popup/Transaction/variants/Yield/YieldWithdrawPosition'));
const YieldClaimReward = new LazyLoader('YieldClaimReward', () => import('@subwallet/extension-koni-ui/Popup/Transaction/variants/Yield/YieldClaimReward'));

// Wallet Connect
const ConnectWalletConnect = new LazyLoader('ConnectWalletConnect', () => import('@subwallet/extension-koni-ui/Popup/WalletConnect/ConnectWalletConnect'));
const ConnectionList = new LazyLoader('ConnectionList', () => import('@subwallet/extension-koni-ui/Popup/WalletConnect/ConnectionList'));
const ConnectionDetail = new LazyLoader('ConnectionDetail', () => import('@subwallet/extension-koni-ui/Popup/WalletConnect/ConnectionDetail'));

// DApps

const DApps = new LazyLoader('DApps', () => import('@subwallet/extension-koni-ui/Popup/DApps'));

const EarningOutlet = new LazyLoader('EarningOutlet', () => import('@subwallet/extension-koni-ui/Popup/Home/Earning/Outlet'));
const EarningOverview = new LazyLoader('EarningOverview', () => import('@subwallet/extension-koni-ui/Popup/Home/Earning/EarningOverview'));
const EarningDemo = new LazyLoader('EarningDemo', () => import('@subwallet/extension-koni-ui/Popup/Home/Earning/EarningDemo'));
const EarningManagement = new LazyLoader('EarningManagement', () => import('@subwallet/extension-koni-ui/Popup/Home/Earning/EarningManagement'));
const EarningNoRouter = new LazyLoader('EarningNoRouter', () => import('@subwallet/extension-koni-ui/Popup/Home/Earning/NoRouter'));

const EarningDoneOutlet = new LazyLoader('EarningDoneOutlet', () => import('@subwallet/extension-koni-ui/Popup/EarningDone/Outlet'));
const EarningDoneContent = new LazyLoader('EarningDoneContent', () => import('@subwallet/extension-koni-ui/Popup/EarningDone/Content'));

const CrowdloanUnlockCampaign = new LazyLoader('CrowdloanUnlockCampaign', () => import('@subwallet/extension-koni-ui/Popup/CrowdloanUnlockCampaign'));
const CheckCrowdloanContributions = new LazyLoader('CrowdloanContributionsResult', () => import('@subwallet/extension-koni-ui/Popup/CrowdloanUnlockCampaign/CheckCrowdloanContributions'));
const CrowdloanContributionsResult = new LazyLoader('CrowdloanContributionsResult', () => import('@subwallet/extension-koni-ui/Popup/CrowdloanUnlockCampaign/CrowdloanContributionsResult'));

const MissionPool = new LazyLoader('MissionPool', () => import('@subwallet/extension-koni-ui/Popup/MissionPool'));

// A Placeholder page
export function Example () {
  const location = useLocation();

  return <PageWrapper>
    <div style={{ padding: 16 }}>{location.pathname}</div>
  </PageWrapper>;
}

export function NestedOutlet () {
  return <Outlet context={useOutletContext()} />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    loader: () => i18nPromise,
    element: <Root />,
    errorElement: <ErrorFallback />,
    children: [
      Welcome.generateRouterObject('/welcome', true),
      BuyTokens.generateRouterObject('/buy-tokens'),
      CreateDone.generateRouterObject('/create-done'),
      {
        ...Home.generateRouterObject('/home'),
        children: [
          Tokens.generateRouterObject('tokens'),
          Statistics.generateRouterObject('statistics'),
          TokenDetailList.generateRouterObject('tokens/detail/:slug'),
          {
            path: 'nfts',
            element: <NestedOutlet />,
            children: [
              NftCollections.generateRouterObject('collections'),
              NftCollectionDetail.generateRouterObject('collection-detail'),
              NftItemDetail.generateRouterObject('item-detail')
            ]
          },
          Crowdloans.generateRouterObject('crowdloans'),
          Staking.generateRouterObject('staking'),
          {
            ...EarningOutlet.generateRouterObject('earning'),
            children: [
              EarningOverview.generateRouterObject('overview'),
              EarningManagement.generateRouterObject('detail'),
              EarningNoRouter.generateRouterObject('')
            ]
          },
          MissionPool.generateRouterObject('mission-pools'),
          History.generateRouterObject('history'),
          History.generateRouterObject('history/:chain/:extrinsicHashOrId'),
          DApps.generateRouterObject('dapps')
        ]
      },
      {
        ...Transaction.generateRouterObject('/transaction'),
        children: [
          SendFund.generateRouterObject('send-fund'),
          SendNFT.generateRouterObject('send-nft'),
          Stake.generateRouterObject('stake'),
          Unstake.generateRouterObject('unstake'),
          CancelUnstake.generateRouterObject('cancel-unstake'),
          ClaimReward.generateRouterObject('claim-reward'),
          Withdraw.generateRouterObject('withdraw'),
          Earn.generateRouterObject('earn'),
          UnYield.generateRouterObject('un-yield'),
          WithdrawYield.generateRouterObject('withdraw-yield'),
          CancelUnYield.generateRouterObject('cancel-un-yield'),
          YieldWithdrawPosition.generateRouterObject('yield-withdraw-position'),
          YieldClaimReward.generateRouterObject('yield-claim'),
          {
            path: 'compound',
            element: <Example />
          }
        ]
      },
      {
        ...TransactionDone.generateRouterObject('transaction-done/:chainType/:chain/:transactionId')
      },
      {
        ...EarningDoneOutlet.generateRouterObject('earning-done'),
        children: [
          EarningDoneContent.generateRouterObject(':chainType/:chain/:transactionId')
        ]
      },
      {
        path: '/keyring',
        element: <Outlet />,
        children: [
          Login.generateRouterObject('login', true),
          CreatePassword.generateRouterObject('create-password'),
          ChangePassword.generateRouterObject('change-password'),
          ApplyMasterPassword.generateRouterObject('migrate-password')
        ]
      },
      {
        path: '/settings',
        children: [
          Settings.generateRouterObject('/settings'),
          Settings.generateRouterObject('list'),
          GeneralSetting.generateRouterObject('general'),
          ManageAddressBook.generateRouterObject('address-book'),
          SecurityList.generateRouterObject('security'),
          ManageWebsiteAccess.generateRouterObject('dapp-access'),
          ManageWebsiteAccessDetail.generateRouterObject('dapp-access-edit'),
          {
            path: 'chains',
            element: <Outlet />,
            children: [
              ManageChains.generateRouterObject('manage'),
              ChainImport.generateRouterObject('import'),
              ChainDetail.generateRouterObject('detail'),
              AddProvider.generateRouterObject('add-provider')
            ]
          },
          {
            path: 'tokens',
            element: <Outlet />,
            children: [
              ManageTokens.generateRouterObject('manage'),
              FungibleTokenImport.generateRouterObject('import-token'),
              TokenDetail.generateRouterObject('detail'),
              NftImport.generateRouterObject('import-nft')
            ]
          }
        ]
      },
      {
        path: 'accounts',
        element: <Outlet />,
        children: [
          NewSeedPhrase.generateRouterObject('new-seed-phrase'),
          ImportSeedPhrase.generateRouterObject('import-seed-phrase'),
          ImportPrivateKey.generateRouterObject('import-private-key'),
          RestoreJson.generateRouterObject('restore-json'),
          ImportQrCode.generateRouterObject('import-by-qr'),
          AttachReadOnly.generateRouterObject('attach-read-only'),
          ConnectPolkadotVault.generateRouterObject('connect-polkadot-vault'),
          ConnectKeystone.generateRouterObject('connect-keystone'),
          ConnectLedger.generateRouterObject('connect-ledger'),
          AccountDetail.generateRouterObject('detail/:accountAddress'),
          AccountExport.generateRouterObject('export/:accountAddress')
        ]
      },
      {
        path: 'wallet-connect',
        element: <Outlet />,
        children: [
          ConnectWalletConnect.generateRouterObject('connect'),
          ConnectionList.generateRouterObject('list'),
          ConnectionDetail.generateRouterObject('detail/:topic')
        ]
      },
      {
        ...EarningOutlet.generateRouterObject('earning-demo'),
        children: [
          EarningDemo.generateRouterObject('')
        ]
      },
      {
        ...CrowdloanUnlockCampaign.generateRouterObject('/crowdloan-unlock-campaign'),
        children: [
          CheckCrowdloanContributions.generateRouterObject('check-contributions'),
          CrowdloanContributionsResult.generateRouterObject('contributions-result')
        ]
      }
    ]
  },
  PhishingDetected.generateRouterObject(`${PHISHING_PAGE_REDIRECT}/:website`)
]);
