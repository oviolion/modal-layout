import React, { useEffect, useState } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { PixelData } from 'vtex.pixel-manager/react/PixelContext'

import usePixelBasedOnContext from './modules/usePixelBasedOnContext'
import {
  useModalDispatch,
  ModalContextProvider,
} from './components/ModalContext'

const CSS_HANDLES = ['triggerContainer'] as const

type TriggerMode = 'click' | 'load' | 'load-session' | 'event'

interface Props {
  trigger?: TriggerMode
  customPixelEventId?: string
  customPixelEventName?: PixelData['event']
  shouldCompareProductContext?: boolean
}

const ModalTrigger: React.FC<Props> = props => {
  const {
    children,
    trigger = 'click',
    customPixelEventId,
    customPixelEventName,
    shouldCompareProductContext = false,
  } = props

  const dispatch = useModalDispatch()
  const handles = useCssHandles(CSS_HANDLES)
  const [openOnLoad, setOpenOnLoad] = useState(false)

  usePixelBasedOnContext({
    customPixelEventId,
    customPixelEventName,
    shouldCompareProductContext,
  })

  useEffect(() => {
    if (openOnLoad || !dispatch) {
      return
    }

    if (trigger === 'load-session') {
      if (sessionStorage.getItem('hasOpenedModal') === 'true') {
        return
      }

      sessionStorage.setItem('hasOpenedModal', 'true')
    }

    if (trigger !== 'load-session' && trigger !== 'load') {
      return
    }

    dispatch({ type: 'OPEN_MODAL' })
    setOpenOnLoad(true)
  }, [trigger, dispatch, openOnLoad])

  const handleModalOpen = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (dispatch) {
      dispatch({ type: 'OPEN_MODAL' })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter') {
      return
    }

    e.stopPropagation()
    if (dispatch) {
      dispatch({ type: 'OPEN_MODAL' })
    }
  }

  if (trigger === 'click') {
    return (
      <div
        tabIndex={0}
        role="button"
        onKeyDown={handleKeyDown}
        onClick={handleModalOpen}
        className={`${handles.triggerContainer} bg-transparent pa0 bw0 dib`}
      >
        {children}
      </div>
    )
  }

  return <>{children}</>
}

const EnhancedModalTrigger: React.FC = props => {
  return (
    <ModalContextProvider>
      <ModalTrigger {...props} />
    </ModalContextProvider>
  )
}

export default EnhancedModalTrigger
