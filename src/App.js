import React, { useEffect, useState } from 'react'; import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, } from 'firebase/auth'; import { db, ref, set, onValue, remove, auth } from './firebase';

const ADMIN_UID = "mZFDI5RBWSTR43r6kBIAGvXf80t1"; const rooms = ['101', '102', '103', '104', '105', 'Conference'];

const App = () => { const [user, setUser] = useState(null); const [bookings, setBookings] = useState([]); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [newBooking, setNewBooking] = useState({ guestName: '', roomId: '', checkIn: '', checkOut: '', guests: 1, amount: 0, advance: 0, });

useEffect(() => { onAuthStateChanged(auth, (u) => setUser(u)); const bookingsRef = ref(db, 'bookings'); onValue(bookingsRef, (snapshot) => { const data = snapshot.val(); setBookings(data ? Object.values(data) : []); }); }, []);

const handleLogin = () => { signInWithEmailAndPassword(auth, email, password).catch((err) => alert(err.message) ); };

const handleSignup = () => { createUserWithEmailAndPassword(auth, email, password).catch((err) => alert(err.message) ); };

const handleLogout = () => signOut(auth);

const isRoomConflict = (roomId, checkIn, checkOut) => { return bookings.some((b) => { return ( b.roomId === roomId && ((checkIn >= b.checkIn && checkIn < b.checkOut) || (checkOut > b.checkIn && checkOut <= b.checkOut) || (checkIn <= b.checkIn && checkOut >= b.checkOut)) ); }); };

const handleBooking = () => { const id = Date.now(); const { roomId, checkIn, checkOut } = newBooking;

if (isRoomConflict(roomId, checkIn, checkOut)) {
  alert('Room already booked for selected dates.');
  return;
}

const booking = { ...newBooking, id };
set(ref(db, `bookings/${id}`), booking);
setNewBooking({
  guestName: '',
  roomId: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  amount: 0,
  advance: 0,
});

};

const handleDelete = (id) => { remove(ref(db, bookings/${id})); };

const today = new Date().toISOString().split('T')[0];

return ( <div style={{ fontFamily: 'Arial', padding: 20, background: '#f7f9fc', minHeight: '100vh' }}> {!user ? ( <div style={{ maxWidth: 400, margin: 'auto', marginTop: 60, background: '#fff', padding: 30, borderRadius: 10, boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}> <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Hotel Login</h2> <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', marginBottom: 15, padding: 10 }} /> <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', marginBottom: 15, padding: 10 }} /> <button onClick={handleLogin} style={{ width: '100%', padding: 10, background: '#007bff', color: '#fff', border: 'none', borderRadius: 5 }}>Login</button> <button onClick={handleSignup} style={{ width: '100%', padding: 10, marginTop: 10, background: '#6c757d', color: '#fff', border: 'none', borderRadius: 5 }}>Sign Up</button> </div> ) : ( <div style={{ maxWidth: 900, margin: 'auto' }}> <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}> <h2>Welcome, {user.email}</h2> <button onClick={handleLogout} style={{ padding: 10, background: '#dc3545', color: '#fff', border: 'none', borderRadius: 5 }}>Logout</button> </div>

<div style={{ marginBottom: 30 }}>
        <h3 style={{ marginBottom: 10 }}>New Booking</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <input placeholder="Guest Name" value={newBooking.guestName} onChange={(e) => setNewBooking({ ...newBooking, guestName: e.target.value })} />
          <select value={newBooking.roomId} onChange={(e) => setNewBooking({ ...newBooking, roomId: e.target.value })}>
            <option value="">Select Room</option>
            {rooms.map(r => <option key={r}>{r}</option>)}
          </select>
          <input type="date" value={newBooking.checkIn} onChange={(e) => setNewBooking({ ...newBooking, checkIn: e.target.value })} />
          <input type="date" value={newBooking.checkOut} onChange={(e) => setNewBooking({ ...newBooking, checkOut: e.target.value })} />
          <input type="number" placeholder="Guests" value={newBooking.guests} onChange={(e) => setNewBooking({ ...newBooking, guests: +e.target.value })} />
          <input type="number" placeholder="Total Amount ₹" value={newBooking.amount} onChange={(e) => setNewBooking({ ...newBooking, amount: +e.target.value })} />
          <input type="number" placeholder="Advance ₹" value={newBooking.advance} onChange={(e) => setNewBooking({ ...newBooking, advance: +e.target.value })} />
        </div>
        <button onClick={handleBooking} style={{ marginTop: 15, padding: 10, background: '#28a745', color: '#fff', border: 'none', borderRadius: 5 }}>Book Now</button>
      </div>

      <h3>Booking History ({today})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead style={{ background: '#343a40', color: '#fff' }}>
          <tr>
            <th style={{ padding: 10 }}>Guest</th>
            <th>Room</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Guests</th>
            <th>Amount</th>
            <th>Advance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: 10 }}>{b.guestName}</td>
              <td>{b.roomId}</td>
              <td>{b.checkIn}</td>
              <td>{b.checkOut}</td>
              <td>{b.guests}</td>
              <td>₹{b.amount}</td>
              <td>₹{b.advance}</td>
              <td>
                {user.uid === ADMIN_UID && <button onClick={() => handleDelete(b.id)} style={{ color: 'red' }}>Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

); };

export default App;

