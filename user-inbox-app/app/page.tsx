"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const { data } = await axios.post('http://localhost:3000/auth/login', { email, password });

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('email', data.email);
      localStorage.setItem('role', data.role); 
      
      if (data.role === 'admin') {
        router.push('/admin');  
      } else {
        router.push('/inbox'); 
      }
    } catch (error) {
      alert('Invalid login credentials');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', margin: 'auto' }}>
      <h2>Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{ marginBottom: '10px', padding: '8px' }}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={{ marginBottom: '10px', padding: '8px' }}
      />
      <button onClick={handleLogin} style={{ padding: '8px' }}>
        Login
      </button>
    </div>
  );
}
