import React, { useEffect, useState } from 'react';
  import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';





export default function AllUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'users'));
        setUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
      } catch (e) {
  console.log("🔥 FIRESTORE ERROR:", e);
}
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      
      {users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <ul>
          {users.map(u => (
            <li key={u.uid}>
              <strong>UID:</strong> {u.uid} | <strong>Name:</strong> {u.firstName ?? '—'} {u.lastName ?? '—'} | <strong>Email:</strong> {u.email ?? '—'} | <strong>Phone:</strong> {u.phone ?? '—'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  
}
