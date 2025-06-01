import React, { useState, useEffect } from 'react';
import { db, ref, set, onValue, remove, auth } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ADMIN_UID = "mZFDI5RBWSTR43r6kBIAGvXf80t1";
const rooms = ['101', '102', '103', '104', '105', 'Conference'];

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
    advance: 0,
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

  const isRoomConflict = (roomId, checkIn, checkOut) => {
    return bookings.some((b) => {
      return (
        b.roomId === roomId &&
        ((checkIn >= b.checkIn && checkIn < b.checkOut) ||
          (checkOut > b.checkIn && checkOut <= b.checkOut) ||
          (checkIn <= b.checkIn && checkOut >= b.checkOut))
      );
    });
  };

  const handleBooking = () => {
    const id = Date.now();
    const { roomId, checkIn, checkOut } = newBooking;

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
        ["Advance", "₹" + b.advance],
      ],
    });
    doc.save(`Invoice_${b.guestName}.pdf`);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.checkIn === today);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
  const availableRooms = 6 - todayBookings.length;

  return (
    <div className="min-h-screen bg-gray-100 p-4 text-sm font-sans">
      {!user ? (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-2xl text-center font-bold mb-4">Hotel Login</h2>
          <input
            className="w-full p-2 mb-3 border rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full p-2 mb-3 border rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded mb-2"
          >
            Login
          </button>
          <button
            onClick={handleSignup}
            className="w-full bg-gray-600 text-white py-2 rounded"
          >
            Sign Up
          </button>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className="bg-white p-4 rounded shadow mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Welcome, {user.email}</h2>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1 rounded"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded text-center">
              <p className="text-blue-600">Today's Bookings</p>
              <p className="text-xl font-bold">{todayBookings.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded text-center">
              <p className="text-green-600">Available Rooms</p>
              <p className="text-xl font-bold">{availableRooms}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded text-center">
              <p className="text-purple-600">Total Revenue</p>
              <p className="text-xl font-bold">₹{totalRevenue}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Create Booking</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                className="border p-2 rounded"
                placeholder="Guest Name"
                value={newBooking.guestName}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, guestName: e.target.value })
                }
              />
              <select
                className="border p-2 rounded"
                value={newBooking.roomId}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, roomId: e.target.value })
                }
              >
                <option value="">Select Room</option>
                {rooms.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input
                className="border p-2 rounded"
                type="date"
                value={newBooking.checkIn}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, checkIn: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                type="date"
                value={newBooking.checkOut}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, checkOut: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                type="number"
                placeholder="Guests"
                value={newBooking.guests}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, guests: +e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                type="number"
                placeholder="Amount (₹)"
                value={newBooking.amount}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, amount: +e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                type="number"
                placeholder="Advance (₹)"
                value={newBooking.advance}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, advance: +e.target.value })
                }
              />
            </div>
            <button
              onClick={handleBooking}
              className="mt-4 bg-blue-600 text-white py-2 px-6 rounded"
            >
              Book
            </button>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">
              Booking History ({today})
            </h3>
            <table className="w-full border text-sm">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="p-2">Guest</th>
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
                {bookings.map((b) => (
                  <tr key={b.id} className="text-center border-t">
                    <td className="p-2">{b.guestName}</td>
                    <td>{b.roomId}</td>
                    <td>{b.checkIn}</td>
                    <td>{b.checkOut}</td>
                    <td>{b.guests}</td>
                    <td>₹{b.amount}</td>
                    <td>₹{b.advance}</td>
                    <td>
                      <button
                        onClick={() => downloadInvoice(b)}
                        className="text-blue-600 underline"
                      >
                        Invoice
                      </button>
                      {user.uid === ADMIN_UID && (
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="text-red-600 ml-2 underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
