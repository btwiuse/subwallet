// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/background/types';
import { Layout, SocialButtonGroup } from '@subwallet/extension-koni-ui/components';
import { CREATE_RETURN, DEFAULT_ROUTER_PATH } from '@subwallet/extension-koni-ui/constants';
import { ScreenContext } from '@subwallet/extension-koni-ui/contexts/ScreenContext';
import { useAutoNavigateToCreatePassword } from '@subwallet/extension-koni-ui/hooks';
import { CreateDoneParam, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, PageIcon } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowCircleRight, CheckCircle, Wallet, X } from 'phosphor-react';
import React, { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import MigrateDone from './Keyring/ApplyMasterPassword/Done';

type Props = ThemeProps;

const Component: React.FC<Props> = (props: Props) => {
  useAutoNavigateToCreatePassword();
  const navigate = useNavigate();

  const { isWebUI } = useContext(ScreenContext);
  const locationState = useLocation().state as CreateDoneParam;
  const [accounts] = useState<AccountJson[] | undefined>(locationState?.accounts);
  const [returnPath, setReturnStorage] = useLocalStorage(CREATE_RETURN, DEFAULT_ROUTER_PATH);

  const { className } = props;

  const onDone = useCallback(() => {
    navigate(returnPath);
    setReturnStorage(DEFAULT_ROUTER_PATH);
  }, [navigate, returnPath, setReturnStorage]);

  const { t } = useTranslation();

  if (accounts) {
    return (
      <Layout.Base
        showBackButton={false}
        title={t('Successful')}
      >
        <div className={className}>
          <MigrateDone
            accounts={accounts}
          />

          <div className='__button-wrapper'>
            <Button
              block={true}
              className={'__footer-button'}
              icon={
                (
                  <Icon
                    phosphorIcon={CheckCircle}
                    weight='fill'
                  />
                )
              }
              onClick={onDone}
            >
              {t('Finish')}
            </Button>
          </div>
        </div>
      </Layout.Base>
    );
  }

  return (
    <Layout.WithSubHeaderOnly
      rightFooterButton={!isWebUI
        ? {
          children: t('Go to home'),
          onClick: onDone,
          icon: <Icon
            phosphorIcon={ArrowCircleRight}
            weight={'fill'}
          />
        }
        : undefined}
      showBackButton={false}
      subHeaderLeft={(
        <Icon
          phosphorIcon={X}
          size='md'
        />
      )}
      title={t('Successful')}
    >
      <div className={CN(className)}>
        <div className='page-icon'>
          <PageIcon
            color='var(--page-icon-color)'
            iconProps={{
              weight: 'fill',
              phosphorIcon: CheckCircle
            }}
          />
        </div>
        <div className='title'>
          {t('All done!')}
        </div>
        <div className='description'>
          {t('Follow along with product updates or reach out if you have any questions.')}
        </div>
        <SocialButtonGroup />

        {
          isWebUI && (
            <div className={'__button-wrapper'}>
              <Button
                block={true}
                className={'__button'}
                icon={(
                  <Icon
                    phosphorIcon={Wallet}
                    weight='fill'
                  />
                )}
                onClick={onDone}
                schema={'primary'}
              >
                {t('Go to portfolio')}
              </Button>
            </div>
          )
        }
      </div>
    </Layout.WithSubHeaderOnly>
  );
};

const CreateDone = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    textAlign: 'center',

    '.page-icon': {
      display: 'flex',
      justifyContent: 'center',
      marginTop: token.controlHeightLG,
      marginBottom: token.margin,
      '--page-icon-color': token.colorSecondary
    },

    '.title': {
      marginTop: token.margin,
      marginBottom: token.margin,
      fontWeight: token.fontWeightStrong,
      fontSize: token.fontSizeHeading3,
      lineHeight: token.lineHeightHeading3,
      color: token.colorTextBase
    },

    '.description': {
      padding: `0 ${token.controlHeightLG - token.padding}px`,
      marginTop: token.margin,
      marginBottom: token.margin * 2,
      fontSize: token.fontSizeHeading5,
      lineHeight: token.lineHeightHeading5,
      color: token.colorTextDescription,
      textAlign: 'center'
    },

    '.__button-wrapper': {
      paddingTop: 64
    },

    '.web-ui-enable &': {
      maxWidth: '416px',
      paddingLeft: token.padding,
      paddingRight: token.padding,
      margin: '0 auto',

      '.page-icon': {
        marginTop: 0
      },

      '.title': {
        marginTop: 0
      },

      '.description': {
        marginTop: 0
      }
    }
  };
});

export default CreateDone;
