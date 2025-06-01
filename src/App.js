import React, { useState, useEffect } from 'react';
import { db, ref, set, onValue, remove, auth } from './firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ADMIN_UID = "mZFDI5RBWSTR43r6kBIAGvXf80t1";

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
    onAuthStateChanged(auth, (u) => setUser(u));
    onValue(ref(db, 'bookings'), (snapshot) => {
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

  const downloadInvoice = (b) => {
    const doc = new jsPDF();
    doc.text("Hotel Satyam - Booking Invoice", 14, 20);
    doc.autoTable({
      startY: 30,
      head: [["Field", "Details"]],
      body: [
        ["Guest", b.guestName],
        ["Room", b.roomId],
        ["Check-in", b.checkIn],
        ["Check-out", b.checkOut],
        ["Guests", b.guests],
        ["Amount", "₹" + b.amount],
      ],
    });
    doc.save(`Invoice_${b.guestName}.pdf`);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.checkIn === today);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
  const availableRooms = 6 - todayBookings.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {!user ? (
        <div className="max-w-md mx-auto bg-white shadow-md p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Login or Sign Up</h2>
          <input
            className="w-full p-2 mb-3 border rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full p-2 mb-4 border rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-3">
            <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
            <button onClick={handleSignup} className="w-full bg-green-600 text-white py-2 rounded">Sign Up</button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-4 mb-4 rounded shadow flex justify-between items-center">
            <h2 className="text-xl font-semibold">Welcome, {user.email}</h2>
            <button onClick={handleLogout} className="bg-gray-300 px-4 py-1 rounded">Logout</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded text-center">
              <p className="text-sm text-blue-600">Today's Bookings</p>
              <p className="text-xl font-bold">{todayBookings.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded text-center">
              <p className="text-sm text-green-600">Available Rooms</p>
              <p className="text-xl font-bold">{availableRooms}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded text-center">
              <p className="text-sm text-purple-600">Total Revenue</p>
              <p className="text-xl font-bold">₹{totalRevenue}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Create a Booking</h3>
            <div className="grid gap-3">
              <input className="border p-2 rounded" placeholder="Guest Name" value={newBooking.guestName}
                onChange={(e) => setNewBooking({ ...newBooking, guestName: e.target.value })} />
              <input className="border p-2 rounded" placeholder="Room ID" value={newBooking.roomId}
                onChange={(e) => setNewBooking({ ...newBooking, roomId: e.target.value })} />
              <input className="border p-2 rounded" type="date" value={newBooking.checkIn}
                onChange={(e) => setNewBooking({ ...newBooking, checkIn: e.target.value })} />
              <input className="border p-2 rounded" type="date" value={newBooking.checkOut}
                onChange={(e) => setNewBooking({ ...newBooking, checkOut: e.target.value })} />
              <input className="border p-2 rounded" type="number" placeholder="Number of Guests" value={newBooking.guests}
                onChange={(e) => setNewBooking({ ...newBooking, guests: +e.target.value })} />
              <input className="border p-2 rounded" type="number" placeholder="Amount (₹)" value={newBooking.amount}
                onChange={(e) => setNewBooking({ ...newBooking, amount: +e.target.value })} />
              <button onClick={handleBooking} className="bg-blue-600 text-white py-2 rounded">Save Booking</button>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">All Bookings</h3>
            {bookings.length === 0 ? (
              <p>No bookings found.</p>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="border-b py-3">
                  <p><strong>Guest:</strong> {b.guestName}</p>
                  <p><strong>Room:</strong> {b.roomId}</p>
                  <p><strong>Check-in:</strong> {b.checkIn}</p>
                  <p><strong>Check-out:</strong> {b.checkOut}</p>
                  <p><strong>Guests:</strong> {b.guests}</p>
                  <p><strong>Amount:</strong> ₹{b.amount}</p>
                  <button onClick={() => downloadInvoice(b)} className="text-blue-600 underline">Download Invoice</button>
                  {user.uid === ADMIN_UID && (
                    <button onClick={() => handleDelete(b.id)} className="text-red-600 ml-4 underline">Delete</button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
