/**
 * CRITICAL COMPONENT: Credits Exhausted Modal
 * 
 * This modal MUST be shown when a user runs out of credits/tokens.
 * It completely blocks access to tools until the user upgrades.
 * 
 * SECURITY: This is a UX layer only. Real blocking happens server-side.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Coins, CreditCard, Zap } from 'lucide-react';

interface CreditsExhaustedModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsRemaining: number;
  creditsRequired: number;
  toolName?: string;
}

export function CreditsExhaustedModal({
  isOpen,
  onClose,
  creditsRemaining,
  creditsRequired,
  toolName = 'this tool',
}: CreditsExhaustedModalProps) {
  const navigate = useNavigate();

  // Prevent closing the modal by clicking outside or pressing ESC
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [isOpen]);

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  const isCompletelyOutOfCredits = creditsRemaining <= 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <Coins className="h-8 w-8 text-orange-600 dark:text-orange-500" />
          </div>
          <AlertDialogTitle className="text-center text-2xl">
            {isCompletelyOutOfCredits ? 'Credits Exhausted' : 'Insufficient Credits'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-4">
            {isCompletelyOutOfCredits ? (
              <>
                <p className="text-base font-medium">
                  You have used all your free credits!
                </p>
                <p>
                  Your account has <span className="font-bold text-orange-600">0 credits</span> remaining.
                  Upgrade to continue using AURION powerful tools.
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-medium">
                  Not enough credits to use {toolName}
                </p>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Required</div>
                    <div className="font-bold text-orange-600">{creditsRequired} credits</div>
                  </div>
                  <div className="text-2xl text-muted-foreground">→</div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Available</div>
                    <div className="font-bold">{creditsRemaining} credits</div>
                  </div>
                </div>
              </>
            )}

            <div className="mt-6 rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Upgrade to unlock:</span>
              </div>
              <ul className="text-sm space-y-1 ml-6 text-left list-disc">
                <li>1,000+ credits per month</li>
                <li>HD image generation</li>
                <li>Advanced AI features</li>
                <li>Priority support</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <AlertDialogAction
            onClick={handleUpgrade}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            View Plans & Upgrade
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook to check credits before tool usage
 * Returns a function that shows the modal if credits are insufficient
 */
export function useCreditsCheck() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<{
    creditsRemaining: number;
    creditsRequired: number;
    toolName?: string;
  }>({
    creditsRemaining: 0,
    creditsRequired: 0,
  });

  const checkCredits = (
    creditsRemaining: number,
    creditsRequired: number,
    toolName?: string
  ): boolean => {
    if (creditsRemaining < creditsRequired) {
      setModalProps({ creditsRemaining, creditsRequired, toolName });
      setIsModalOpen(true);
      return false;
    }
    return true;
  };

  const CreditsModal = () => (
    <CreditsExhaustedModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      {...modalProps}
    />
  );

  return { checkCredits, CreditsModal, isModalOpen };
}
