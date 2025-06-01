import React, { useState, useEffect } from 'react';
import { db, ref, set, onValue, remove, auth } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ADMIN_UID = "mZFDI5RBWSTR43r6kBIAGvXf80t1";
const rooms = ['101', '102', '103', '104', '105', 'Conference'];

const App = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
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

  const handleLogin = () => signInWithEmailAndPassword(auth, email, password).catch((err) => alert(err.message));
  const handleSignup = () => createUserWithEmailAndPassword(auth, email, password).catch((err) => alert(err.message));
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
      advance: 0
    });
    setCurrentPage('dashboard');
  };

  const handleDelete = (id) => remove(ref(db, `bookings/${id}`));

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
      ]
    });
    doc.save(`Invoice_${b.guestName}.pdf`);
  };

  const exportBookingsToExcel = () => {
    const wsData = [["Guest", "Room", "Check-in", "Check-out", "Guests", "Amount", "Advance"]];
    bookings.forEach(b => wsData.push([b.guestName, b.roomId, b.checkIn, b.checkOut, b.guests, b.amount, b.advance]));
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, "Hotel_Bookings.xlsx");
  };

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.checkIn === today);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
  const availableRooms = 6 - todayBookings.length;
  const filteredBookings = bookings.filter(b => {
    const nameMatch = b.guestName.toLowerCase().includes(searchTerm.toLowerCase());
    const dateMatch = dateFilter ? b.checkIn === dateFilter || b.checkOut === dateFilter : true;
    return nameMatch && dateMatch;
  });

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-purple-700">Hotel Satyam</h2>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-purple-300 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-purple-300 rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-between">
            <button onClick={handleLogin} className="bg-indigo-500 text-white px-4 py-2 rounded w-1/2 mr-2">Login</button>
            <button onClick={handleSignup} className="bg-green-500 text-white px-4 py-2 rounded w-1/2 ml-2">Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={darkMode ? "dark bg-gray-900 text-white min-h-screen" : "bg-gray-100 min-h-screen"}>
      <div className="fixed top-2 right-2 z-50">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs"
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="p-4 pb-24">
        {currentPage === 'dashboard' && (
          <div>
            <h1 className="text-2xl font-bold mb-4">🏠 Welcome, {user.email}</h1>
            <p className="mb-2">Total Revenue: ₹{totalRevenue}</p>
            <p className="mb-2">Available Rooms Today: {availableRooms}</p>
            <ul>
              {todayBookings.map((b) => <li key={b.id}>✅ {b.guestName} - Room {b.roomId}</li>)}
            </ul>
          </div>
        )}

        {currentPage === 'booking' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">➕ New Booking</h1>
            <input
              type="text"
              placeholder="Guest Name"
              value={newBooking.guestName}
              onChange={(e) => setNewBooking({...newBooking, guestName: e.target.value})}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <select
              value={newBooking.roomId}
              onChange={(e) => setNewBooking({...newBooking, roomId: e.target.value})}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Room</option>
              {rooms.map(room => <option key={room} value={room}>Room {room}</option>)}
            </select>
            <input
              type="date"
              placeholder="Check-in"
              value={newBooking.checkIn}
              onChange={(e) => setNewBooking({...newBooking, checkIn: e.target.value})}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="date"
              placeholder="Check-out"
              value={newBooking.checkOut}
              onChange={(e) => setNewBooking({...newBooking, checkOut: e.target.value})}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="number"
              placeholder="Number of Guests"
              value={newBooking.guests}
              onChange={(e) => setNewBooking({...newBooking, guests: parseInt(e.target.value)})}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="number"
              placeholder="Total Amount"
              value={newBooking.amount}
              onChange={(e) => setNewBooking({...newBooking, amount: parseFloat(e.target.value)})}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="number"
              placeholder="Advance Payment"
              value={newBooking.advance}
              onChange={(e) => setNewBooking({...newBooking, advance: parseFloat(e.target.value)})}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={handleBooking}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg font-bold"
            >
              💾 Save Booking
            </button>
          </div>
        )}

        {currentPage === 'history' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">📋 Booking History</h1>
            <input
              type="text"
              placeholder="Search by guest name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={exportBookingsToExcel}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              📥 Export to Excel
            </button>
            {filteredBookings.map(b => (
              <div key={b.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                <h2 className="font-bold">{b.guestName} - Room {b.roomId}</h2>
                <p>₹{b.amount} | Advance ₹{b.advance}</p>
                <p>{b.checkIn} ➡ {b.checkOut}</p>
                <button
                  onClick={() => downloadInvoice(b)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  📄 Invoice
                </button>
                {user.uid === ADMIN_UID && (
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded ml-2"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 flex justify-around border-t">
        <button onClick={() => setCurrentPage('dashboard')} className="text-xl">🏠</button>
        <button onClick={() => setCurrentPage('booking')} className="text-xl">➕</button>
        <button onClick={() => setCurrentPage('history')} className="text-xl">📋</button>
        <button onClick={handleLogout} className="text-xl text-red-500">🚪</button>
      </div>
    </div>
  );
};

export default App;
