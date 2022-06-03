import { useState } from 'react'
import { Alert, IconButton, Collapse } from '@mui/material'
import {
  CheckCircleOutline,
  WarningAmber,
  InfoOutlined,
  Close,
} from '@mui/icons-material'
import { NotificationContent } from './NotificationContent'
import { theme } from '../../../../theme'

export interface PageNotificationsProps {
  severity?: 'error' | 'warning' | 'info' | 'success'
  open: boolean,
  onCloseNotification?: React.MouseEventHandler
  title?: string
  description?: string
  contactText?: string
  contactLinks?: string
  contactNewTab?: boolean
  showIcon?: boolean
}

export function color(severity: string) {
  switch (severity) {
    case 'info':
      return theme.palette.support.info
    case 'error':
      return theme.palette.support.error
    case 'warning':
      return theme.palette.support.warning
    case 'success':
      return theme.palette.support.success
    default:
      return ''
  }
}

export function titleIcon(severity: string) {
  switch (severity) {
    case 'info':
      return <InfoOutlined fontSize="inherit" sx={{ color: color(severity) }} />
    case 'error':
      return <WarningAmber fontSize="inherit" sx={{ color: color(severity) }} />
    case 'warning':
      return <WarningAmber fontSize="inherit" sx={{ color: color(severity) }} />
    case 'success':
      return (
        <CheckCircleOutline
          fontSize="inherit"
          sx={{ color: color(severity) }}
        />
      )
    default:
      return ''
  }
}

export const PageNotifications = ({
  severity = 'info',
  open,
  onCloseNotification,
  title,
  description,
  contactText,
  contactLinks,
  contactNewTab,
  showIcon,
}: PageNotificationsProps) => {
  return (
    <Collapse in={open}>
      <Alert
        severity={severity}
        variant="outlined"
        icon={showIcon === false ? false : titleIcon(severity)}
        sx={{
          borderColor: color(severity),
          borderRadius: '8px',
          boxShadow: '0px 20px 40px rgba(80, 80, 80, 0.3)',
        }}
        action={
          <IconButton
            aria-label="close"
            size="small"
            onClick={onCloseNotification}
            sx={{
              color: theme.palette.icon.icon01,
              marginTop: '5px',
              marginRight: '5px',
            }}
          >
            <Close fontSize="inherit" />
          </IconButton>
        }
      >
        <NotificationContent
          title={title}
          description={description}
          contactText={contactText}
          contactLinks={contactLinks}
          contactNewTab={contactNewTab}
          titleColor={color(severity)}
        />
      </Alert>
    </Collapse>
  )
}
