import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ShieldAlert } from 'lucide-react'

interface HonorModalProps {
  open: boolean
  action: 'close' | 'reopen'
  onConfirm: () => void
  onCancel: () => void
}

export function HonorModal({ open, action, onConfirm, onCancel }: HonorModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="h-5 w-5 text-darden-orange" />
            <AlertDialogTitle>Hold up! Honor system check.</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm leading-relaxed">
            This operation should strictly be performed by the <strong>original poster</strong> of this listing.
            {action === 'close'
              ? ' Marking a listing as closed signals to classmates that this item is no longer available.'
              : ' Reopening a listing signals to classmates that this item is available again.'}
            <br /><br />
            Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>No, go back</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-darden-navy hover:bg-darden-navy/90 text-white dark:bg-darden-orange dark:hover:bg-darden-orange/90"
          >
            Yes, I'm the poster
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
