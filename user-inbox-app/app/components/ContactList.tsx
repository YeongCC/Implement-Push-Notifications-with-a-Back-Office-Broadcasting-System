"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

interface Contact {
  _id: string;
  email: string;
}

interface ContactListProps {
  onSelectContact: (contact: Contact) => void;
}

export default function ContactList({ onSelectContact }: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const [socket, setSocket] = useState<any>(null);
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (!token) {
          console.error('Token not found');
          return;
        }
        const { data } = await axios.get('http://localhost:3000/users/contacts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(data);
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
      }
    };
    fetchContacts();
    const userId = localStorage.getItem('user_id');
    console.log('Connecting to WebSocket server with userId:', userId);
    const socketConnection = io('http://localhost:3000', {
      query: { userId: userId },
    });
    setSocket(socketConnection);

    socketConnection.on('unreadCountsUpdated', (updatedUnreadCounts) => {
      const counts = updatedUnreadCounts.reduce((acc: any, { senderId, unreadCount }: any) => {
        acc[senderId] = unreadCount;
        return acc;
      }, {});
      console.log('Unread counts updated:', counts);
      setUnreadCounts(counts); 
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-3">Contact List</h3>
      <ul className="list-group">
        {contacts.map((contact) => (
          <li
            key={contact._id}
            className="list-group-item d-flex justify-content-between align-items-center"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectContact(contact)}
          >
            <span>{contact.email}</span>
            {unreadCounts[contact._id] > 0 && (
              <span className="badge bg-danger rounded-pill">
                {unreadCounts[contact._id]}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
