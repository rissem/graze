import * as React from "react"
import { createPortal } from "react-dom"
import { CloseButton } from "./close-button"

interface DialogRootProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (state: { open: boolean }) => void
}

interface DialogContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType | undefined>(undefined)

export function DialogRoot({ children, open = false, onOpenChange }: DialogRootProps) {
  const [isOpen, setIsOpen] = React.useState(open)

  React.useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.({ open })
  }

  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

function useDialogContext() {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("Dialog components must be used within a DialogRoot")
  }
  return context
}

interface DialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function DialogTrigger({ children, asChild = false }: DialogTriggerProps) {
  const { setOpen } = useDialogContext()

  const handleClick = () => {
    setOpen(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    })
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  )
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>
  backdrop?: boolean
}

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(function DialogContent(props, ref) {
  const {
    children,
    className = "",
    portalled = true,
    portalRef,
    backdrop = true,
    ...rest
  } = props

  const { open } = useDialogContext()

  if (!open) return null

  const content = (
    <>
      {backdrop && (
        <div className="fixed inset-0 bg-black/50 z-40" />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          ref={ref}
          className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-auto ${className}`}
          {...rest}
        >
          {children}
        </div>
      </div>
    </>
  )

  if (portalled) {
    const container = portalRef?.current || document.body
    return createPortal(content, container)
  }

  return content
})

interface DialogCloseTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  asChild?: boolean
}

export const DialogCloseTrigger = React.forwardRef<
  HTMLButtonElement,
  DialogCloseTriggerProps
>(function DialogCloseTrigger({ children, asChild = true, ...props }, ref) {
  const { setOpen } = useDialogContext()

  const handleClick = () => {
    setOpen(false)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      ref,
      ...props,
    })
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className="absolute top-4 right-4"
      {...props}
    >
      <CloseButton
        size="sm"
        className="text-gray-500 hover:text-gray-900"
      >
        {children}
      </CloseButton>
    </button>
  )
})

interface DialogActionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  asChild?: boolean
}

export function DialogActionTrigger({ children, asChild = false, ...props }: DialogActionTriggerProps) {
  const { setOpen } = useDialogContext()

  const handleClick = (e: React.MouseEvent) => {
    props.onClick?.(e)
    setOpen(false)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      ...props,
    })
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

export function DialogHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function DialogBody({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function DialogFooter({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 flex justify-end space-x-2 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={`text-lg font-medium text-gray-900 ${className}`} {...props}>
      {children}
    </h2>
  )
}

export function DialogDescription({ children, className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-gray-500 ${className}`} {...props}>
      {children}
    </p>
  )
}

export const DialogBackdrop = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`fixed inset-0 bg-black/50 z-40 ${className}`} {...props}>
    {children}
  </div>
)
