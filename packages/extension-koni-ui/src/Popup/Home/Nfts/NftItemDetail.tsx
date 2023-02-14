// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Layout from '@subwallet/extension-koni-ui/components/Layout';
import PageWrapper from '@subwallet/extension-koni-ui/components/Layout/PageWrapper';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import useGetAccountInfoByAddress from '@subwallet/extension-koni-ui/hooks/screen/common/useGetAccountInfoByAddress';
import useGetChainInfo from '@subwallet/extension-koni-ui/hooks/screen/common/useGetChainInfo';
import useScanExplorerAddressUrl from '@subwallet/extension-koni-ui/hooks/screen/home/useScanExplorerAddressUrl';
import useTranslation from '@subwallet/extension-koni-ui/hooks/useTranslation';
import { INftItemDetail } from '@subwallet/extension-koni-ui/Popup/Home/Nfts/utils';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, ButtonProps, Field, Image } from '@subwallet/react-ui';
import Icon from '@subwallet/react-ui/es/icon';
import SwAvatar from '@subwallet/react-ui/es/sw-avatar';
import { Info, PaperPlaneTilt } from 'phosphor-react';
import React, { useCallback, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import { isEthereumAddress } from '@polkadot/util-crypto';

import LogosMap from '../../../assets/logo';

type Props = ThemeProps

const NFT_DESCRIPTION_MAX_LENGTH = 70;

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const dataContext = useContext(DataContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { extendToken, token } = useTheme() as Theme;

  const { collectionInfo, nftItem } = location.state as INftItemDetail;
  const originChainInfo = useGetChainInfo(nftItem.chain);
  const ownerAccountInfo = useGetAccountInfoByAddress(nftItem.owner || '');
  const accountExternalUrl = useScanExplorerAddressUrl(nftItem.chain, nftItem.owner);

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onClickSend = useCallback(() => {
    navigate('/transaction/send-nft', { state: nftItem });
  }, [navigate, nftItem]);

  const subHeaderRightButton: ButtonProps[] = [
    {
      children: t<string>('Send'),
      onClick: () => {
        navigate('/transaction/send-nft', { state: nftItem });
      }
    }
  ];

  const ownerPrefix = useCallback(() => {
    if (nftItem.owner) {
      const theme = isEthereumAddress(nftItem.owner) ? 'ethereum' : 'substrate';

      return (
        <SwAvatar
          identPrefix={42}
          size={token.fontSizeXL}
          theme={theme}
          value={nftItem.owner}
        />
      );
    }

    return <div />;
  }, [nftItem.owner, token.fontSizeXL]);

  const originChainLogo = useCallback(() => {
    return (
      <Image
        src={LogosMap[nftItem.chain]}
        width={token.fontSizeXL}
      />
    );
  }, [nftItem.chain, token.fontSizeXL]);

  const ownerInfo = useCallback(() => {
    return (
      <span>
        <span>{ownerAccountInfo?.name}</span> <span className={'nft_item_detail__owner_address'}>({`${nftItem?.owner.slice(0, 4)}...${nftItem?.owner.slice(-4)}`})</span>
      </span>
    );
  }, [nftItem?.owner, ownerAccountInfo?.name]);

  const handleClickExternalAccountInfo = useCallback(() => {
    try {
      // eslint-disable-next-line no-void
      void chrome.tabs.create({ url: accountExternalUrl, active: true }).then(() => console.log('redirecting'));
    } catch (e) {
      console.log('error redirecting to a new tab');
    }
  }, [accountExternalUrl]);

  const handleClickExternalCollectionInfo = useCallback(() => {
    try {
      // eslint-disable-next-line no-void
      void chrome.tabs.create({ url: nftItem.externalUrl, active: true }).then(() => console.log('redirecting'));
    } catch (e) {
      console.log('error redirecting to a new tab');
    }
  }, [nftItem.externalUrl]);

  const externalInfoIcon = useCallback((type: 'account' | 'collection') => {
    return (
      <div
        className={'nft_item_detail__external_icon'}
        onClick={type === 'account' ? handleClickExternalAccountInfo : handleClickExternalCollectionInfo}
      >
        <Icon
          customSize={'20px'}
          phosphorIcon={Info}
          type='phosphor'
          weight={'light'}
        />
      </div>
    );
  }, [handleClickExternalAccountInfo, handleClickExternalCollectionInfo]);

  return (
    <PageWrapper
      className={`${className}`}
      resolve={dataContext.awaitStores(['nft', 'accountState', 'chainStore'])}
    >
      <Layout.Base
        onBack={onBack}
        showBackButton={true}
        showSubHeader={true}
        subHeaderBackground={'transparent'}
        subHeaderCenter={false}
        subHeaderIcons={subHeaderRightButton}
        subHeaderPaddingVertical={true}
        title={nftItem.name || nftItem.id}
      >
        <div className={'nft_item_detail__container'}>
          <Image
            height={358}
            src={nftItem.image || extendToken.logo}
          />

          <div className={'nft_item_detail__info_container'}>
            <div className={'nft_item_detail__section_title'}>{t<string>('NFT information')}</div>
            {
              nftItem.description && (
                <div
                  className={'nft_item_detail__description_container'}
                  style={{ cursor: nftItem.description.length > NFT_DESCRIPTION_MAX_LENGTH ? 'pointer' : 'auto' }}
                >
                  <div className={'nft_item_detail__description_content'}>
                    {nftItem.description.length > NFT_DESCRIPTION_MAX_LENGTH ? `${nftItem.description.slice(0, NFT_DESCRIPTION_MAX_LENGTH)}...` : nftItem.description}
                  </div>
                  <div className={'nft_item_detail__description_title'}>
                    <Icon
                      customSize={'28px'}
                      iconColor={token.colorIcon}
                      phosphorIcon={Info}
                      type='phosphor'
                      weight={'fill'}
                    />
                    <div>{t<string>('Description')}</div>
                  </div>
                </div>
              )
            }

            <Field
              content={collectionInfo.collectionName || collectionInfo.collectionId}
              label={t<string>('NFT collection name')}
              suffix={nftItem.externalUrl && externalInfoIcon('collection')}
            />

            <Field
              content={ownerInfo()}
              label={t<string>('Owned by')}
              prefix={nftItem.owner && ownerPrefix()}
              suffix={externalInfoIcon('account')}
            />

            <Field
              content={originChainInfo.name}
              label={t<string>('Chain')}
              prefix={originChainLogo()}
            />
          </div>

          {
            nftItem.properties && (
              <div className={'nft_item_detail__prop_section'}>
                <div className={'nft_item_detail__section_title'}>{t<string>('Properties')}</div>
                <div className={'nft_item_detail__atts_container'}>
                  {
                    Object.entries(nftItem.properties).map(([attName, attValueObj], index) => {
                      const { value: attValue } = attValueObj as Record<string, string>;

                      return (
                        <Field
                          content={attValue}
                          key={index}
                          label={attName}
                        />
                      );
                    })
                  }
                </div>
              </div>
            )
          }

          <Button
            block
            icon={<Icon
              customSize={'28px'}
              phosphorIcon={PaperPlaneTilt}
              type='phosphor'
              weight={'fill'}
            />}
            onClick={onClickSend}
          >
            <span className={'nft_item_detail__send_text'}>Send</span>
          </Button>
        </div>
      </Layout.Base>
    </PageWrapper>
  );
}

const NftItemDetail = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.nft_item_detail__container': {
      marginTop: token.marginSM,
      paddingRight: token.margin,
      paddingLeft: token.margin,
      paddingBottom: token.margin
    },

    '.nft_item_detail__info_container': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.marginXS,
      marginTop: token.margin,
      marginBottom: token.margin
    },

    '.nft_item_detail__atts_container': {
      marginTop: token.margin,
      display: 'flex',
      flexWrap: 'wrap',
      gap: token.marginXS
    },

    '.nft_item_detail__section_title': {
      fontSize: token.fontSizeLG,
      color: token.colorTextHeading,
      lineHeight: token.lineHeightLG
    },

    '.nft_item_detail__send_text': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      color: token.colorTextLight1
    },

    '.nft_item_detail__prop_section': {
      marginBottom: token.margin
    },

    '.nft_item_detail__owner_address': {
      color: token.colorTextDescription
    },

    '.nft_item_detail__external_icon': {
      cursor: 'pointer'
    },

    '.nft_item_detail__description_container': {
      padding: token.paddingSM,
      backgroundColor: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG
    },

    '.nft_item_detail__description_content': {
      color: token.colorTextDescription,
      fontSize: token.fontSize,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },

    '.nft_item_detail__description_title': {
      marginTop: token.margin,
      display: 'flex',
      alignItems: 'center',
      gap: token.marginXXS,
      color: token.colorTextLabel,
      fontSize: token.fontSize,
      fontWeight: token.headingFontWeight,
      lineHeight: token.lineHeight
    }
  });
});

export default NftItemDetail;