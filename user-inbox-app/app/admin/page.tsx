"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPage() {
  const [users, setUsers] = useState([]); // List of users
  const [recipientId, setRecipientId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('');
  const token = localStorage.getItem('token');
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!token) {
          setNotificationStatus('Error: Not authorized');
          return;
        }

        const response = await axios.get('http://localhost:3000/users/getallusers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSendNotification = async () => {
    try {
      if (!token) {
        setNotificationStatus('Error: Not authorized');
        return;
      }
      if (recipientId === "all") {
        const promises = users.map((user:any) =>
          axios.post(
            'http://localhost:3000/admin/send-notification',
            {
              recipientId: user._id,
              content: messageContent,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        );
        await Promise.all(promises);
        setNotificationStatus('Notification sent to all users!');
      } else {
        await axios.post(
          'http://localhost:3000/admin/send-notification',
          {
            recipientId,
            content: messageContent,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotificationStatus('Notification sent successfully!');
      }

      setRecipientId('');
      setMessageContent('');
    } catch (error) {
      setNotificationStatus('Error sending notification');
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Admin: Send Notification</h2>
      <div className="form-group mt-3">
        <label>Select Recipient</label>
        <select
          className="form-control"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
        >
          <option value="">Select a user</option>
          <option value="all">All Users</option> 
          {users.map((user:any) => (
            <option key={user._id} value={user._id}>
              {user.email}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group mt-3">
        <label>Message Content</label>
        <textarea
          className="form-control"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Enter the message content"
          rows={3}
        ></textarea>
      </div>
      <button className="btn btn-primary mt-3" onClick={handleSendNotification}>
        Send Notification
      </button>
      {notificationStatus && <p className="mt-3">{notificationStatus}</p>}
    </div>
  );
}

export default AdminPage;
