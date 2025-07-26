'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth(requiredPermissions = []) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.every(permission => 
        session.user.permissions?.includes(permission) || session.user.role === 'admin'
      );
      
      if (!hasPermission) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [session, status, requiredPermissions, router]);

  return { session, status };
}