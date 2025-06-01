import React, { useState, useEffect } from 'react';
import { db, ref, set, onValue, remove, auth } from './firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

const ADMIN_UID = "replace-with-your-admin-uid";

const App = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newBooking, setNewBooking] = useState({
    guestName: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    amount: 0,
  });

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    const bookingsRef = ref(db, 'bookings');
    onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val();
      setBookings(data ? Object.values(data) : []);
    });
  }, []);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password).catch((err) =>
      alert(err.message)
    );
  };

  const handleSignup = () => {
    createUserWithEmailAndPassword(auth, email, password).catch((err) =>
      alert(err.message)
    );
  };

  const handleLogout = () => signOut(auth);

  const handleBooking = () => {
    const id = Date.now();
    const booking = { ...newBooking, id };
    set(ref(db, `bookings/${id}`), booking);
    setNewBooking({
      guestName: '',
      roomId: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      amount: 0,
    });
  };

  const handleDelete = (id) => {
    remove(ref(db, `bookings/${id}`));
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      {!user ? (
        <div>
          <h2>Login or Sign Up</h2>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><br /><br />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /><br /><br />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleSignup} style={{ marginLeft: 10 }}>Sign Up</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {user.email}</h2>
          <button onClick={handleLogout}>Logout</button>
          <hr style={{ margin: '20px 0' }} />
          <h3>Create a Booking</h3>
          <input placeholder="Guest Name" value={newBooking.guestName} onChange={(e) => setNewBooking({ ...newBooking, guestName: e.target.value })} /><br />
          <input placeholder="Room ID" value={newBooking.roomId} onChange={(e) => setNewBooking({ ...newBooking, roomId: e.target.value })} /><br />
          <input type="date" value={newBooking.checkIn} onChange={(e) => setNewBooking({ ...newBooking, checkIn: e.target.value })} /><br />
          <input type="date" value={newBooking.checkOut} onChange={(e) => setNewBooking({ ...newBooking, checkOut: e.target.value })} /><br />
          <input type="number" placeholder="Guests" value={newBooking.guests} onChange={(e) => setNewBooking({ ...newBooking, guests: +e.target.value })} /><br />
          <input type="number" placeholder="Amount (₹)" value={newBooking.amount} onChange={(e) => setNewBooking({ ...newBooking, amount: +e.target.value })} /><br /><br />
          <button onClick={handleBooking}>Save Booking</button>
          <hr style={{ margin: '20px 0' }} />
          <h3>All Bookings</h3>
          {bookings.length === 0 ? <p>No bookings found.</p> : bookings.map((b) => (
            <div key={b.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: 10 }}>
              <p><strong>Guest:</strong> {b.guestName}</p>
              <p><strong>Room:</strong> {b.roomId}</p>
              <p><strong>Check-in:</strong> {b.checkIn}</p>
              <p><strong>Check-out:</strong> {b.checkOut}</p>
              <p><strong>Guests:</strong> {b.guests}</p>
              <p><strong>Amount:</strong> ₹{b.amount}</p>
              <button onClick={() => window.print()}>Print Invoice</button>
              {' '}
              {user.uid === ADMIN_UID && (
                <button onClick={() => handleDelete(b.id)} style={{ color: 'red', marginLeft: 10 }}>Delete</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
