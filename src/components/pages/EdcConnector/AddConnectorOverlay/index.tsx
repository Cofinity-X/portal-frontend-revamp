/********************************************************************************
 * Copyright (c) 2021, 2023 BMW Group AG
 * Copyright (c) 2021, 2023 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Apache License, Version 2.0 which is available at
 * https://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ********************************************************************************/

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  Button,
  DialogActions,
  DialogHeader,
  CircleProgress,
  Typography,
} from '@catena-x/portal-shared-components'
import ConnectorTypeSelection from './components/ConnectorTypeSelection'
import ConnectorInsertForm from './components/ConnectorInsertForm'
import { useForm } from 'react-hook-form'
import {
  type ConnectorType,
  useFetchOfferSubscriptionsQuery,
  ConnectType,
} from 'features/connector/connectorApiSlice'
import Box from '@mui/material/Box'
import { useFetchOwnCompanyDetailsQuery } from 'features/admin/userApiSlice'
import { useFetchServiceAccountUsersQuery } from 'features/admin/serviceApiSlice'

interface AddCollectorOverlayProps {
  openDialog?: boolean
  connectorStep: number
  handleOverlayClose: () => void
  handleConfirmClick: (data: ConnectorType) => void
  onFormConfirmClick: (data: FormFieldsType) => void
  loading?: boolean
  onStepChange: () => void
  onSubmitClick: (data: FormFieldsType) => void
  newUserLoading?: boolean
  newUserSuccess?: boolean
}

export type FormFieldsType = {
  ConnectorName: string
  ConnectorURL: string
  ConnectorSubscriptionId: string
  ConnectorLocation: string
  ConnectorTechnicalUser: string
  TechnicalUserName: string
  TechnicalUserDescription: string
}

const formFields = {
  ConnectorName: '',
  ConnectorURL: '',
  ConnectorLocation: '',
  ConnectorSubscriptionId: '',
  ConnectorTechnicalUser: '',
  TechnicalUserName: '',
  TechnicalUserDescription: '',
}

const AddConnectorOverlay = ({
  openDialog = false,
  connectorStep,
  handleOverlayClose,
  handleConfirmClick,
  onFormConfirmClick,
  loading,
  onStepChange,
  onSubmitClick,
  newUserLoading,
  newUserSuccess,
}: AddCollectorOverlayProps) => {
  const { t } = useTranslation()
  const { data } = useFetchOfferSubscriptionsQuery()
  const { data: ownCompanyDetails } = useFetchOwnCompanyDetailsQuery()
  const fetchServiceAccountUsers = useFetchServiceAccountUsersQuery().data
  const [newTechnicalUSer, setNewTechnicalUSer] = useState(false)

  const {
    handleSubmit,
    getValues,
    control,
    trigger,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: formFields,
    mode: 'onChange',
  })

  const [selected, setSelected] = useState<ConnectorType>({})

  useEffect(() => {
    if (openDialog) reset(formFields)
  }, [openDialog, reset])

  const onFormSubmit = async () => {
    const validateFields =
      newTechnicalUSer && !newUserSuccess
        ? await trigger(['TechnicalUserName', 'TechnicalUserDescription'])
        : await trigger([
            'ConnectorName',
            'ConnectorURL',
            'ConnectorLocation',
            'ConnectorSubscriptionId',
            'ConnectorTechnicalUser',
          ])
    if (validateFields) {
      newTechnicalUSer && !newUserSuccess
        ? onSubmitClick(getValues() as FormFieldsType)
        : onFormConfirmClick(getValues() as FormFieldsType)
    }
  }

  const onSelect = (service: ConnectorType) => {
    setSelected(service)
  }

  const getTitle = () => {
    if (connectorStep === 1 && selected.type === 'MANAGED_CONNECTOR')
      return t('content.edcconnector.modal.managed.title')
    else if (
      connectorStep === 1 &&
      selected.type === ConnectType.COMPANY_CONNECTOR
    ) {
      return t('content.edcconnector.modal.company.title')
    } else return t('content.edcconnector.modal.title')
  }
  const getIntro = () => {
    if (
      connectorStep === 1 &&
      selected.type === ConnectType.MANAGED_CONNECTOR
    ) {
      return t('content.edcconnector.modal.managed.intro')
    } else if (
      connectorStep === 1 &&
      selected.type === ConnectType.COMPANY_CONNECTOR
    ) {
      return (
        <Typography variant="body1">
          {t('content.edcconnector.modal.company.intro')}
        </Typography>
      )
    } else {
      return t('content.edcconnector.modal.intro')
    }
  }
  return (
    <div>
      <Dialog
        open={openDialog}
        additionalModalRootStyles={{
          width:
            connectorStep === 1 &&
            selected.type === ConnectType.COMPANY_CONNECTOR
              ? '65%'
              : '45%',
        }}
      >
        <DialogHeader
          title={getTitle()}
          intro={getIntro()}
          closeWithIcon={true}
          onCloseWithIcon={() => {
            setSelected({})
            handleOverlayClose()
          }}
        />
        <DialogContent
          sx={{
            padding: '0px 120px 40px 120px',
          }}
        >
          {connectorStep === 0 ? (
            <>
              <ConnectorTypeSelection
                ownCompanyDetails={ownCompanyDetails}
                selectedServiceCallback={onSelect}
              />
            </>
          ) : (
            <>
              <ConnectorInsertForm
                subscriptions={data}
                selectedService={selected}
                fetchServiceAccountUsers={fetchServiceAccountUsers}
                onFormSubmitt={onFormSubmit}
                setNewTechnicalUSer={setNewTechnicalUSer}
                newUserLoading={newUserLoading}
                newUserSuccess={newUserSuccess}
                {...{ handleSubmit, control, errors, trigger }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              if (connectorStep === 1) {
                onStepChange()
              } else {
                setSelected({})
                handleOverlayClose()
              }
            }}
          >
            {connectorStep === 0
              ? `${t('global.actions.cancel')}`
              : `${t('global.actions.back')}`}
          </Button>
          {!loading && (
            <Button
              variant="contained"
              disabled={selected?.id ? false : true}
              onClick={() => {
                connectorStep === 0 && selected?.id
                  ? handleConfirmClick(selected)
                  : onFormSubmit()
              }}
            >
              {connectorStep === 0
                ? `${t('global.actions.next')}`
                : `${t('global.actions.confirm')}`}
            </Button>
          )}
          {loading && (
            <Box
              sx={{
                width: '110px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CircleProgress
                size={40}
                step={1}
                interval={0.1}
                colorVariant={'primary'}
                variant={'indeterminate'}
                thickness={8}
              />
            </Box>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default AddConnectorOverlay
