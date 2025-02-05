// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType, StakingRewardItem, YieldPoolInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/background/KoniTypes';
import { getYieldAvailableActionsByPosition, getYieldAvailableActionsByType, YieldAction } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { BaseModal } from '@subwallet/extension-koni-ui/components/Modal/BaseModal';
import { CANCEL_UN_YIELD_TRANSACTION, CLAIM_YIELD_TRANSACTION, DEFAULT_CANCEL_UN_YIELD_PARAMS, DEFAULT_CLAIM_YIELD_PARAMS, DEFAULT_FAST_WITHDRAW_YIELD_PARAMS, DEFAULT_UN_YIELD_PARAMS, DEFAULT_WITHDRAW_YIELD_PARAMS, DEFAULT_YIELD_PARAMS, EARNING_MORE_ACTION_MODAL, FAST_WITHDRAW_YIELD_TRANSACTION, TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL, TRANSACTION_YIELD_CLAIM_MODAL, TRANSACTION_YIELD_FAST_WITHDRAW_MODAL, TRANSACTION_YIELD_UNSTAKE_MODAL, TRANSACTION_YIELD_WITHDRAW_MODAL, UN_YIELD_TRANSACTION, WITHDRAW_YIELD_TRANSACTION, YIELD_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { ScreenContext } from '@subwallet/extension-koni-ui/contexts/ScreenContext';
import { usePreCheckAction, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { GlobalToken } from '@subwallet/extension-koni-ui/themes';
import { PhosphorIcon, Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getEarnExtrinsicType, getWithdrawExtrinsicType, isAccountAll } from '@subwallet/extension-koni-ui/utils';
import { BackgroundIcon, ModalContext, SettingItem } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowArcLeft, ArrowCircleDown, MinusCircle, PlusCircle, Wallet } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

export type ActionListType = {
  backgroundIconColor: keyof GlobalToken;
  icon: PhosphorIcon;
  label: string;
  action: YieldAction;
  onClick: () => void;
  disabled?: boolean;
}

type Props = ThemeProps & {
  yieldPoolInfo: YieldPoolInfo;
  yieldPositionInfo: YieldPositionInfo;
  stakingRewardItem?: StakingRewardItem;
  additionActions?: (currentActions: ActionListType[]) => ActionListType[],
  onAfterCancel?: () => void;
}

const modalId = EARNING_MORE_ACTION_MODAL;

const Component: React.FC<Props> = (props: Props) => {
  const { additionActions, className, onAfterCancel, stakingRewardItem, yieldPoolInfo, yieldPositionInfo } = props;

  const isAvailable = yieldPoolInfo.stats?.isAvailable ?? true;

  const navigate = useNavigate();
  const { token } = useTheme() as Theme;
  const { t } = useTranslation();

  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { isWebUI } = useContext(ScreenContext);

  const { currentAccount } = useSelector((state) => state.accountState);
  const { poolInfo: poolInfoMap } = useSelector((state) => state.yieldPool);

  const [, setYieldStorage] = useLocalStorage(YIELD_TRANSACTION, DEFAULT_YIELD_PARAMS);
  const [, setUnYieldStorage] = useLocalStorage(UN_YIELD_TRANSACTION, DEFAULT_UN_YIELD_PARAMS);
  const [, setCancelUnYieldStorage] = useLocalStorage(CANCEL_UN_YIELD_TRANSACTION, DEFAULT_CANCEL_UN_YIELD_PARAMS);
  const [, setWithdrawStorage] = useLocalStorage(WITHDRAW_YIELD_TRANSACTION, DEFAULT_WITHDRAW_YIELD_PARAMS);
  const [, setFastWithdrawStorage] = useLocalStorage(FAST_WITHDRAW_YIELD_TRANSACTION, DEFAULT_FAST_WITHDRAW_YIELD_PARAMS);
  const [, setClaimStorage] = useLocalStorage(CLAIM_YIELD_TRANSACTION, DEFAULT_CLAIM_YIELD_PARAMS);

  const preCheckAction = usePreCheckAction(currentAccount?.address, false);

  const onCancel = useCallback(
    () => {
      inactiveModal(modalId);
      onAfterCancel?.();
    },
    [inactiveModal, onAfterCancel]
  );

  const onClickStakeBtn = useCallback(() => {
    const poolInfo = poolInfoMap[yieldPoolInfo.slug];

    const address = currentAccount ? isAccountAll(currentAccount.address) ? '' : currentAccount.address : '';

    setYieldStorage({
      ...DEFAULT_YIELD_PARAMS,
      method: poolInfo.slug,
      from: address,
      chain: poolInfo.chain,
      asset: poolInfo.inputAssets[0]
    });

    navigate('/transaction/earn');
  }, [currentAccount, navigate, poolInfoMap, setYieldStorage, yieldPoolInfo.slug]);

  const onClickUnStakeBtn = useCallback(() => {
    const poolInfo = poolInfoMap[yieldPoolInfo.slug];

    const address = currentAccount ? isAccountAll(currentAccount.address) ? '' : currentAccount.address : '';

    setUnYieldStorage({
      ...DEFAULT_UN_YIELD_PARAMS,
      from: address,
      chain: poolInfo.chain,
      method: poolInfo.slug,
      asset: poolInfo.inputAssets[0]
    });

    if (isWebUI) {
      activeModal(TRANSACTION_YIELD_UNSTAKE_MODAL);
    } else {
      navigate('/transaction/un-yield');
    }
  }, [activeModal, currentAccount, isWebUI, navigate, poolInfoMap, setUnYieldStorage, yieldPoolInfo.slug]);

  const onClickCancelUnStakeBtn = useCallback(() => {
    const poolInfo = poolInfoMap[yieldPoolInfo.slug];

    const address = currentAccount ? isAccountAll(currentAccount.address) ? '' : currentAccount.address : '';

    setCancelUnYieldStorage({
      ...DEFAULT_CANCEL_UN_YIELD_PARAMS,
      from: address,
      chain: poolInfo.chain,
      method: poolInfo.slug,
      asset: poolInfo.inputAssets[0]
    });

    if (isWebUI) {
      activeModal(TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL);
    } else {
      navigate('/transaction/cancel-un-yield');
    }
  }, [activeModal, currentAccount, isWebUI, navigate, poolInfoMap, setCancelUnYieldStorage, yieldPoolInfo.slug]);

  const onClickWithdrawBtn = useCallback(() => {
    const poolInfo = poolInfoMap[yieldPoolInfo.slug];

    const address = currentAccount ? isAccountAll(currentAccount.address) ? '' : currentAccount.address : '';

    const isStaking = [YieldPoolType.NATIVE_STAKING, YieldPoolType.NOMINATION_POOL].includes(poolInfo.type);

    if (isStaking) {
      setWithdrawStorage({
        ...DEFAULT_WITHDRAW_YIELD_PARAMS,
        from: address,
        chain: poolInfo.chain,
        method: poolInfo.slug,
        asset: poolInfo.inputAssets[0]
      });

      if (isWebUI) {
        activeModal(TRANSACTION_YIELD_WITHDRAW_MODAL);
      } else {
        navigate('/transaction/withdraw-yield');
      }
    } else {
      setFastWithdrawStorage({
        ...DEFAULT_FAST_WITHDRAW_YIELD_PARAMS,
        from: address,
        chain: poolInfo.chain,
        method: poolInfo.slug,
        asset: poolInfo.inputAssets[0]
      });

      if (isWebUI) {
        activeModal(TRANSACTION_YIELD_FAST_WITHDRAW_MODAL);
      } else {
        navigate('/transaction/yield-withdraw-position');
      }
    }
  }, [activeModal, currentAccount, isWebUI, navigate, poolInfoMap, setFastWithdrawStorage, setWithdrawStorage, yieldPoolInfo.slug]);

  const onClickClaimBtn = useCallback(() => {
    const poolInfo = poolInfoMap[yieldPoolInfo.slug];

    const address = currentAccount ? isAccountAll(currentAccount.address) ? '' : currentAccount.address : '';

    setClaimStorage({
      ...DEFAULT_CLAIM_YIELD_PARAMS,
      method: poolInfo.slug,
      from: address,
      chain: poolInfo.chain,
      asset: poolInfo.inputAssets[0]
    });

    if (isWebUI) {
      activeModal(TRANSACTION_YIELD_CLAIM_MODAL);
    } else {
      navigate('/transaction/yield-claim');
    }
  }, [activeModal, currentAccount, isWebUI, navigate, poolInfoMap, setClaimStorage, yieldPoolInfo.slug]);

  const availableActions = useMemo(() => {
    return getYieldAvailableActionsByPosition(yieldPositionInfo, yieldPoolInfo, stakingRewardItem?.unclaimedReward);
  }, [stakingRewardItem?.unclaimedReward, yieldPoolInfo, yieldPositionInfo]);

  const actionList: ActionListType[] = useMemo((): ActionListType[] => {
    const actionListByChain = getYieldAvailableActionsByType(yieldPoolInfo);

    return actionListByChain.map((action): ActionListType => {
      if (action === YieldAction.UNSTAKE) {
        return {
          action: action,
          backgroundIconColor: 'magenta-6',
          icon: MinusCircle,
          label: t('Unstake'),
          onClick: preCheckAction(onClickUnStakeBtn, ExtrinsicType.STAKING_LEAVE_POOL)
        };
      } else if (action === YieldAction.WITHDRAW) {
        return {
          action: action,
          backgroundIconColor: 'geekblue-6',
          icon: ArrowCircleDown,
          label: t('Withdraw unstaked funds'),
          onClick: preCheckAction(onClickWithdrawBtn, getWithdrawExtrinsicType(yieldPoolInfo.slug))
        };
      } else if (action === YieldAction.WITHDRAW_EARNING) {
        return {
          action: action,
          backgroundIconColor: 'geekblue-6',
          icon: ArrowCircleDown,
          label: t('Withdraw'),
          onClick: preCheckAction(onClickWithdrawBtn, getWithdrawExtrinsicType(yieldPoolInfo.slug))
        };
      } else if (action === YieldAction.CANCEL_UNSTAKE) {
        return {
          action: action,
          backgroundIconColor: 'purple-8',
          icon: ArrowArcLeft,
          label: t('Cancel unstaking'),
          onClick: preCheckAction(onClickCancelUnStakeBtn, ExtrinsicType.STAKING_CANCEL_UNSTAKE)
        };
      } else if (action === YieldAction.CLAIM_REWARD) {
        return {
          action: action,
          backgroundIconColor: 'green-7',
          icon: Wallet,
          label: t('Claim rewards'),
          onClick: preCheckAction(onClickClaimBtn, ExtrinsicType.STAKING_CLAIM_REWARD)
        };
      } else if (action === YieldAction.START_EARNING) {
        return {
          action: action,
          backgroundIconColor: 'green-6',
          icon: PlusCircle,
          label: t('Earn more'),
          onClick: preCheckAction(onClickStakeBtn, getEarnExtrinsicType(yieldPoolInfo.slug))
        };
      }

      return {
        action: action,
        backgroundIconColor: 'green-6',
        icon: PlusCircle,
        label: t('Stake more'),
        onClick: preCheckAction(onClickStakeBtn, getEarnExtrinsicType(yieldPoolInfo.slug))
      };
    });
  }, [onClickCancelUnStakeBtn, onClickClaimBtn, onClickStakeBtn, onClickUnStakeBtn, onClickWithdrawBtn, preCheckAction, t, yieldPoolInfo]);

  const onPreCheck = usePreCheckAction(currentAccount?.address, false);

  const convertStakingActionToExtrinsicType = useCallback((action: YieldAction): ExtrinsicType => {
    const isPool = yieldPoolInfo.type === YieldPoolType.NOMINATION_POOL;

    switch (action) {
      case YieldAction.STAKE:
        return isPool ? ExtrinsicType.STAKING_BOND : ExtrinsicType.STAKING_JOIN_POOL;
      case YieldAction.UNSTAKE:
        return isPool ? ExtrinsicType.STAKING_UNBOND : ExtrinsicType.STAKING_LEAVE_POOL;
      case YieldAction.WITHDRAW:
        return isPool ? ExtrinsicType.STAKING_WITHDRAW : ExtrinsicType.STAKING_POOL_WITHDRAW;
      case YieldAction.CLAIM_REWARD:
        return ExtrinsicType.STAKING_CLAIM_REWARD;
      case YieldAction.CANCEL_UNSTAKE:
        return ExtrinsicType.STAKING_CANCEL_UNSTAKE;
      case YieldAction.START_EARNING:
        return ExtrinsicType.MINT_LDOT;
      case YieldAction.WITHDRAW_EARNING:
        return ExtrinsicType.REDEEM_LDOT;
      default:
        return ExtrinsicType.UNKNOWN;
    }
  }, [yieldPoolInfo.type]);

  const onClickItem = useCallback((action: YieldAction, onClick: () => void) => {
    return () => {
      if (action === 'CUSTOM_ACTION') {
        onClick();
      } else {
        onPreCheck(onClick, convertStakingActionToExtrinsicType(action))();
      }
    };
  }, [convertStakingActionToExtrinsicType, onPreCheck]);

  const _actionList = useMemo(() => {
    if (additionActions) {
      return additionActions(actionList);
    }

    return actionList;
  }, [actionList, additionActions]);

  const modalContent = (
    <div className={CN(className, 'action-more-container')}>
      {_actionList.map((item) => {
        const disabled = !isAvailable || item.disabled || (item.action !== YieldAction.CUSTOM_ACTION && !availableActions.includes(item.action));

        return (
          <SettingItem
            className={CN(
              'action-more-item',
              {
                disabled: disabled
              }
            )}
            key={item.label}
            leftItemIcon={(
              <BackgroundIcon
                backgroundColor={token[item.backgroundIconColor] as string}
                phosphorIcon={item.icon}
                size='sm'
                weight='fill'
              />
            )}
            name={item.label}
            onPressItem={disabled ? undefined : onClickItem(item.action, item.onClick)}
          />
        );
      })}
    </div>
  );

  return (
    <BaseModal
      closable={true}
      id={modalId}
      maskClosable={true}
      onCancel={onCancel}
      title={t('Actions')}
    >
      {modalContent}
    </BaseModal>
  );
};

const EarningMoreActionModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '&.action-more-container': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeXS
    },

    '.ant-web3-block-right-item': {
      marginRight: 0
    },

    '.disabled': {
      cursor: 'not-allowed',
      opacity: token.opacityDisable,

      '.ant-web3-block': {
        cursor: 'not-allowed'
      },

      '.ant-web3-block:hover': {
        cursor: 'not-allowed',
        background: token.colorBgSecondary
      }
    }
  };
});

export default EarningMoreActionModal;
