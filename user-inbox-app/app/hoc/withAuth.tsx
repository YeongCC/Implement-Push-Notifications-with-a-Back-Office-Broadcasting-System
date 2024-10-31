"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState, ComponentType } from 'react';

export default function withAuth<T extends object>(Component: ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const token = localStorage.getItem('token');
    useEffect(() => {
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false); 
      }
    }, []);

    if (isAuthenticated === null) {
      return <div>Loading...</div>;
    }

    if (isAuthenticated === false) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h1>404 - Page Not Found</h1>
          <p>Please <a href="/" style={{ color: 'blue' }}>log in</a> to access this page.</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
