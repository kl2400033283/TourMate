'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, FirestorePermissionError, errorEmitter } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const roles = [
  { id: 'Tourist', label: 'Tourist' },
  { id: 'home stay host', label: 'Home Stay Host' },
  { id: 'tour guide', label: 'Tour Guide' },
  { id: 'admin', label: 'Admin' },
];

export function RoleSelectionDialog({ open, onOpenChange, signupData }) {
  const [selectedRole, setSelectedRole] = useState('Tourist');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleSave = () => {
    if (!user || !firestore || !signupData) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save your role. Missing user data.',
      });
      return;
    }

    setIsLoading(true);
    const userDocRef = doc(firestore, 'users', user.uid);
    
    const nameParts = signupData.fullName.trim().split(' ').filter(Boolean);
    const firstName = nameParts.shift() || '';
    const lastName = nameParts.join(' ') || '';

    const initialStatus = ['home stay host', 'tour guide'].includes(selectedRole) ? 'pending_verification' : 'active';

    const profileData = {
      uid: user.uid,
      email: user.email,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: `${signupData.countryCode}${signupData.phoneNumber}`,
      role: selectedRole,
      status: initialStatus,
    };

    setDoc(userDocRef, profileData, { merge: true })
      .then(() => {
        toast({
          title: 'Welcome!',
          description: `Your role has been set to ${selectedRole}.`,
        });
        onOpenChange(false);
        switch (selectedRole) {
          case 'home stay host':
            router.push('/host-dashboard');
            break;
          case 'tour guide':
            router.push('/tour-guide-dashboard');
            break;
          case 'admin':
            router.push('/admin-dashboard');
            break;
          default: // Tourist
            router.push('/profile');
            break;
        }
      })
      .catch(() => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: profileData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Your Role</DialogTitle>
          <DialogDescription>
            Select a role that best describes you. This will help us tailor your experience.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="space-y-2">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center space-x-3">
                <RadioGroupItem value={role.id} id={`role-${role.id}`} />
                <Label htmlFor={`role-${role.id}`} className="font-normal">{role.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Saving...' : 'Save and Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
