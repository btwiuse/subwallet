// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { YieldPoolType } from '@subwallet/extension-base/background/KoniTypes';
import { FilterModal, SortingModal } from '@subwallet/extension-koni-ui/components';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { openInNewTab } from '@subwallet/extension-koni-ui/utils';
import { BackgroundIcon, Button, Icon, ModalContext, Typography } from '@subwallet/react-ui';
import { ButtonType } from '@subwallet/react-ui/es/button';
import CN from 'classnames';
import { CaretDown, FadersHorizontal, IconProps, Plus, Question, SortAscending } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import EarningTokenList from './EarningTokenList';

interface FilterOption {
  label: string;
  value: string;
}

interface SortOption {
  label: string;
  value: string;
  desc: boolean;
}

interface Props extends ThemeProps {
  // Common
  showAdd?: boolean;

  // Filter
  filterSelectionMap: Record<string, boolean>;
  onApplyFilter: () => void;
  onChangeFilterOption: (value: string, isCheck: boolean) => void;
  onCloseFilterModal: () => void;
  selectedFilters: string[];

  // Sort
  onChangeSortOpt: (value: string) => void;
  onResetSort: () => void;
  sortOptions: SortOption[];
  selectedSort: string;
}
interface ToolbarBtnProps extends ThemeProps {
  icon: React.ReactNode;
  label?: string;
  type?: ButtonType;
  onClick: () => void;
  noSuffix?: boolean;
}

const _ToolbarBtn: React.FC<ToolbarBtnProps> = (props: ToolbarBtnProps) => {
  const { className, icon, label, noSuffix = false, onClick, type } = props;
  const { token } = useTheme() as Theme;

  return (
    <Button
      icon={icon}
      onClick={onClick}
      schema='secondary'
      shape={'round'}
      size={'xs'}
      type={type}
    >
      <div className={className}>
        <Typography.Text>{label}</Typography.Text>
        {
          !noSuffix && (
            <Icon
              className={'earning-filter-icon'}
              customSize={'12px'}
              iconColor={token.colorTextLight4}
              phosphorIcon={CaretDown}
              weight={'bold'}
            />
          )
        }
      </div>
    </Button>
  );
};

const FILTER_MODAL_ID = 'earning-filter-modal';

const SORTING_MODAL_ID = 'earning-sorting-modal';

const ToolbarBtn = styled(_ToolbarBtn)<ToolbarBtnProps>(({ theme: { token } }: ToolbarBtnProps) => {
  return ({
    display: 'flex',
    gap: token.paddingXS,
    alignItems: 'center',
    paddingLeft: token.paddingXS,

    '.earning-filter-icon': {
      width: '12px',
      height: '12px'
    }

  });
});

const Component: React.FC<Props> = (props: Props) => {
  const { className = '', filterSelectionMap, onApplyFilter, onChangeFilterOption, onChangeSortOpt, onCloseFilterModal, onResetSort, selectedFilters, selectedSort, showAdd, sortOptions } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { token } = useTheme() as Theme;

  const { activeModal } = useContext(ModalContext);

  const filterOptions = useMemo((): FilterOption[] => [
    { label: t('Nomination pool'), value: YieldPoolType.NOMINATION_POOL },
    // { label: t('Native staking'), value: YieldPoolType.NATIVE_STAKING },
    { label: t('Liquid staking'), value: YieldPoolType.LIQUID_STAKING },
    { label: t('Lending'), value: YieldPoolType.LENDING }
    // { label: t('Parachain staking'), value: YieldPoolType.PARACHAIN_STAKING },
    // { label: t('Single farming'), value: YieldPoolType.SINGLE_FARMING }
  ], [t]);

  const filterLabel = useMemo(() => {
    if (!selectedFilters.length) {
      return t('All type');
    } else {
      if (selectedFilters.length === 1) {
        return filterOptions.find((opt) => opt.value === selectedFilters[0])?.label;
      } else {
        return t(`${selectedFilters.length} selected`);
      }
    }
  }, [selectedFilters, filterOptions, t]);

  const sortingLabel = useMemo(() => {
    return sortOptions.find((item) => item.value === selectedSort)?.label || '';
  }, [sortOptions, selectedSort]);

  const openFilterModal = useCallback(() => activeModal(FILTER_MODAL_ID), [activeModal]);
  const openSortingModal = useCallback(() => activeModal(SORTING_MODAL_ID), [activeModal]);
  const onClickHelpBtn = useCallback(() => {
    openInNewTab('https://docs.subwallet.app/main/web-dashboard-user-guide/earning/faqs')();
  }, []);

  const onClickMore = useCallback(() => {
    navigate('/home/earning/overview');
  }, [navigate]);

  const renderIconBtn = useCallback((icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>) => (
    <BackgroundIcon
      backgroundColor={token.colorTextLight4}
      iconColor={token.colorWhite}
      phosphorIcon={icon}
      size={'sm'}
    />
  ), [token]);

  return (
    <div className={className}>
      <EarningTokenList className={'token-list-container'} />

      <div className={CN('button-group')}>
        {
          showAdd && (
            <Button
              icon={
                <Icon
                  phosphorIcon={Plus}
                  weight='fill'
                />
              }
              onClick={onClickMore}
              size='xs'
              type='ghost'
            />
          )
        }
        <ToolbarBtn
          className='help-button'
          icon={
            <Icon
              iconColor={token['gray-4']}
              phosphorIcon={Question}
              weight={'duotone'}
            />
          }
          label={t('Help')}
          noSuffix={true}
          onClick={onClickHelpBtn}
          type={'ghost'}
        />
        <ToolbarBtn
          icon={renderIconBtn(FadersHorizontal)}
          label={filterLabel}
          onClick={openFilterModal}
        />
        <ToolbarBtn
          icon={renderIconBtn(SortAscending)}
          label={sortingLabel}
          onClick={openSortingModal}
        />
      </div>

      <FilterModal
        applyFilterButtonTitle={t('Apply filter')}
        id={FILTER_MODAL_ID}
        onApplyFilter={onApplyFilter}
        onCancel={onCloseFilterModal}
        onChangeOption={onChangeFilterOption}
        optionSelectionMap={filterSelectionMap}
        options={filterOptions}
        title={t('Filter')}
      />

      <SortingModal
        id={SORTING_MODAL_ID}
        onChangeOption={onChangeSortOpt}
        onReset={onResetSort}
        optionSelection={selectedSort}
        options={sortOptions}
      />
    </div>
  );
};

const EarningToolbar = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: token.padding,

    '.earning-filter-icon': {
      width: '12px',
      height: '12px'
    },

    '.button-group': {
      display: 'flex',
      alignItems: 'center',
      gap: token.paddingXS
    },

    '.help-button': {
      '.ant-typography': {
        color: token.colorTextLight4
      }
    }
  });
});

export default EarningToolbar;
