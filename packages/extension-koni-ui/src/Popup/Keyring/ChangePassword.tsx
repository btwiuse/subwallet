// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AlertBox, CloseIcon, Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import InstructionContainer, { InstructionContentType } from '@subwallet/extension-koni-ui/components/InstructionContainer';
import { ScreenContext } from '@subwallet/extension-koni-ui/contexts/ScreenContext';
import { useDefaultNavigate, useFocusFormItem, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { keyringChangeMasterPassword } from '@subwallet/extension-koni-ui/messaging';
import { FormCallbacks, FormFieldData, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { renderBaseConfirmPasswordRules, renderBasePasswordRules, simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { Button, Form, Icon, Input, PageIcon } from '@subwallet/react-ui';
import CN from 'classnames';
import { FloppyDiskBack, ShieldCheck } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps

enum FormFieldName {
  PASSWORD = 'password',
  OLD_PASSWORD = 'old_password',
  CONFIRM_PASSWORD = 'confirm_password',
}

interface ChangePasswordFormState {
  [FormFieldName.PASSWORD]: string;
  [FormFieldName.OLD_PASSWORD]: string;
  [FormFieldName.CONFIRM_PASSWORD]: string;
}

const formName = 'change-password-form';

const Component: React.FC<Props> = ({ className }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goHome } = useDefaultNavigate();
  const { isWebUI } = useContext(ScreenContext);
  const [form] = Form.useForm<ChangePasswordFormState>();
  const [isDisabled, setIsDisable] = useState(true);
  const [submitError, setSubmitError] = useState('');

  const [loading, setLoading] = useState(false);

  const instructionContents: InstructionContentType[] = [
    {
      title: 'Why do I need to enter a password?',
      description: 'For your wallet protection, SubWallet locks your wallet after 15 minutes of inactivity. You will need this password to unlock it.',
      type: 'warning'
    },
    {
      title: 'Can I recover a password?',
      description: 'The password is stored securely on your device. We will not be able to recover it for you, so make sure you remember it!',
      type: 'warning'
    }
  ];

  const newPasswordRules = useMemo(() => renderBasePasswordRules(t('New password'), t), [t]);
  const confirmPasswordRules = useMemo(() => renderBaseConfirmPasswordRules(FormFieldName.PASSWORD, t), [t]);

  const goBack = useCallback(() => {
    navigate('/settings/security');
  }, [navigate]);

  const goBackSetting = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  const onSubmit: FormCallbacks<ChangePasswordFormState>['onFinish'] = useCallback((values: ChangePasswordFormState) => {
    const password = values[FormFieldName.PASSWORD];
    const oldPassword = values[FormFieldName.OLD_PASSWORD];

    if (password && oldPassword) {
      setLoading(true);
      setTimeout(() => {
        keyringChangeMasterPassword({
          createNew: false,
          newPassword: password,
          oldPassword: oldPassword
        }).then((res) => {
          if (!res?.status) {
            form.setFields([{ name: FormFieldName.OLD_PASSWORD, errors: res.errors }]);
          } else {
            goHome();
          }
        }).catch((e: Error) => {
          form.setFields([{ name: FormFieldName.OLD_PASSWORD, errors: [e.message] }]);
        }).finally(() => {
          setLoading(false);
        });
      }, 1000);
    }
  }, [form, goHome]);

  const onUpdate: FormCallbacks<ChangePasswordFormState>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    const { empty, error } = simpleCheckForm(allFields);

    setSubmitError('');
    setIsDisable(error || empty);
  }, []);

  const onChangePassword = useCallback(() => {
    form.resetFields([FormFieldName.CONFIRM_PASSWORD]);
  }, [form]);

  useFocusFormItem(form, FormFieldName.OLD_PASSWORD);

  return (
    <PageWrapper className={CN(className)}>
      <Layout.WithSubHeaderOnly
        onBack={goBack}
        rightFooterButton={!isWebUI
          ? {
            children: t('Save'),
            onClick: form.submit,
            loading: loading,
            disabled: isDisabled,
            icon: (
              <Icon
                phosphorIcon={FloppyDiskBack}
                weight='fill'
              />
            )
          }
          : undefined}
        subHeaderIcons={[
          {
            icon: <CloseIcon />,
            onClick: isWebUI ? goBackSetting : goHome
          }
        ]}
        title={t('Change password')}
      >
        <div className={CN('body-container', {
          '__web-ui': isWebUI
        })}
        >
          {!isWebUI && (
            <div>
              <div className='page-icon'>
                <PageIcon
                  color='var(--page-icon-color)'
                  iconProps={{
                    weight: 'fill',
                    phosphorIcon: ShieldCheck
                  }}
                />
              </div>
              <div className='title'>
                {t('Change your password')}
              </div>
            </div>
          )}
          <div className='form-container'>
            <AlertBox
              description={t('Recommended security practice')}
              title={t('Always choose a strong password!')}
              type='warning'
            />
            <Form
              form={form}
              initialValues={{
                [FormFieldName.OLD_PASSWORD]: '',
                [FormFieldName.PASSWORD]: '',
                [FormFieldName.CONFIRM_PASSWORD]: ''
              }}
              name={formName}
              onFieldsChange={onUpdate}
              onFinish={onSubmit}
            >
              <Form.Item
                name={FormFieldName.OLD_PASSWORD}
                rules={[
                  {
                    message: t('Password is required'),
                    required: true
                  }
                ]}
                statusHelpAsTooltip={isWebUI}
              >
                <Input
                  disabled={loading}
                  placeholder={t('Current password')}
                  type='password'
                />
              </Form.Item>
              <Form.Item
                name={FormFieldName.PASSWORD}
                rules={newPasswordRules}
                statusHelpAsTooltip={isWebUI}
              >
                <Input
                  disabled={loading}
                  onChange={onChangePassword}
                  placeholder={t('New password')}
                  type='password'
                />
              </Form.Item>
              <Form.Item
                name={FormFieldName.CONFIRM_PASSWORD}
                rules={confirmPasswordRules}
                statusHelpAsTooltip={isWebUI}
              >
                <Input
                  disabled={loading}
                  placeholder={t('Confirm new password')}
                  type='password'
                />
              </Form.Item>
              {submitError && (
                <Form.Item
                  help={submitError}
                  validateStatus={submitError && 'error'}
                />

              )}
              {isWebUI && (
                <Button
                  disabled={isDisabled}
                  icon={
                    <Icon
                      phosphorIcon={FloppyDiskBack}
                      weight='fill'
                    />
                  }
                  loading={loading}
                  onClick={form.submit}
                >
                  {t('Save')}
                </Button>
              )}
            </Form>
          </div>
          {isWebUI && (
            <div className='instruction-container'>
              <InstructionContainer contents={instructionContents} />
            </div>
          )}
        </div>
      </Layout.WithSubHeaderOnly>
    </PageWrapper>
  );
};

const ChangePassword = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    '.body-container': {
      padding: `0 ${token.padding}px`,
      textAlign: 'center',

      '&.__web-ui': {
        padding: `${token.padding + 24}px ${token.padding}px ${token.padding}px`,
        width: extendToken.twoColumnWidth,
        maxWidth: '100%',
        display: 'flex',
        margin: '0 auto',
        gap: 16,

        '.form-container': {
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          '.ant-btn': {
            width: '100%'
          }
        },
        '& > *': {
          flex: 1
        }
      },

      '.page-icon': {
        display: 'flex',
        justifyContent: 'center',
        marginTop: token.margin,
        '--page-icon-color': token.colorSecondary
      },

      '.title': {
        marginTop: token.margin,
        marginBottom: token.margin * 2,
        fontWeight: token.fontWeightStrong,
        fontSize: token.fontSizeHeading3,
        lineHeight: token.lineHeightHeading3,
        color: token.colorTextBase
      }
    }
  };
});

export default ChangePassword;
