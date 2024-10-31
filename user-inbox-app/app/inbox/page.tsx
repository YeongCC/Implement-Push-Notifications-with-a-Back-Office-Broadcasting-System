"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import withAuth from '../hoc/withAuth';
import { useRouter } from 'next/navigation';
import ContactList from '../components/ContactList';
import ChatBox from '../components/ChatBox';

interface Contact {
  _id: string;
  email: string;
}
const VAPID_PUBLIC_KEY:any = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function InboxPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const router = useRouter();
  const token = localStorage.getItem('token');

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', registration);

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          subscribeUserToPush(registration);
        } else {
          console.warn('Notification permission denied');
        }
      }
    };

    const subscribeUserToPush = async (registration: ServiceWorkerRegistration) => {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await axios.post('http://localhost:3000/messages/subscriptions', subscription, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('User is subscribed:', subscription);
    };

    registerServiceWorker();
  }, []);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Inbox</h2>
        <div>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <ContactList onSelectContact={handleSelectContact} />
        </div>

        <div className="col-md-8">
          {selectedContact ? (
            <ChatBox
              selectedContactId={selectedContact._id}
              selectedContactEmail={selectedContact.email}
            />
          ) : (
            <p>Select a contact to start chatting.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(InboxPage);
