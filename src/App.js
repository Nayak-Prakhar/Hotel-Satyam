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
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-2xl p-10 space-y-8">
          <h2 className="text-4xl font-bold text-center text-purple-700 mb-8">Hotel Satyam</h2>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-6 py-5 text-lg border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-6 py-5 text-lg border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex flex-col space-y-4">
            <button onClick={handleLogin} className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors">Login</button>
            <button onClick={handleSignup} className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors">Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={darkMode ? "dark bg-gray-900 text-white min-h-screen" : "bg-gray-100 min-h-screen"}>
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-gray-800 text-white px-4 py-3 rounded-full text-sm font-medium shadow-lg"
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="p-6 pb-32 min-h-screen">
        {currentPage === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold mb-6 text-center">🏠 Welcome!</h1>
            <div className="text-lg mb-4">{user.email}</div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-3 text-green-600">💰 Total Revenue</h2>
                <p className="text-3xl font-bold">₹{totalRevenue}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-3 text-blue-600">🏨 Available Rooms Today</h2>
                <p className="text-3xl font-bold">{availableRooms}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-3 text-purple-600">📅 Today's Bookings</h2>
                {todayBookings.length > 0 ? (
                  <div className="space-y-3">
                    {todayBookings.map((b) => (
                      <div key={b.id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-lg font-semibold">✅ {b.guestName}</p>
                        <p className="text-gray-600 dark:text-gray-300">Room {b.roomId}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-lg text-gray-500">No bookings today</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentPage === 'booking' && (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-center mb-8">➕ New Booking</h1>
            
            <div className="space-y-5">
              <input
                type="text"
                placeholder="Guest Name"
                value={newBooking.guestName}
                onChange={(e) => setNewBooking({...newBooking, guestName: e.target.value})}
                className="w-full p-5 text-lg rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
              
              <select
                value={newBooking.roomId}
                onChange={(e) => setNewBooking({...newBooking, roomId: e.target.value})}
                className="w-full p-5 text-lg rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Room</option>
                {rooms.map(room => <option key={room} value={room}>Room {room}</option>)}
              </select>
              
              <div>
                <label className="block text-lg font-semibold mb-2">Check-in Date</label>
                <input
                  type="date"
                  value={newBooking.checkIn}
                  onChange={(e) => setNewBooking({...newBooking, checkIn: e.target.value})}
                  className="w-full p-5 text-lg rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-lg font-semibold mb-2">Check-out Date</label>
                <input
                  type="date"
                  value={newBooking.checkOut}
                  onChange={(e) => setNewBooking({...newBooking, checkOut: e.target.value})}
                  className="w-full p-5 text-lg rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <input
                type="number"
                placeholder="Number of Guests"
                value={newBooking.guests}
                onChange={(e) => setNewBooking({...newBooking, guests: parseInt(e.target.value)})}
                className="w-full p-5 text-lg rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
              
              <input
                type="number"
                placeholder="Total Amount (₹)"
                value={newBooking.amount}
                onChange={(e) => setNewBooking({...newBooking, amount: parseFloat(e.target.value)})}
                className="w-full p-5 text-lg rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
              
              <input
                type="number"
                placeholder="Advance Payment (₹)"
                value={newBooking.advance}
                onChange={(e) => setNewBooking({...newBooking, advance: parseFloat(e.target.value)})}
                className="w-full p-5 text-lg rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
              
              <button
                onClick={handleBooking}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-6 rounded-xl text-xl font-bold shadow-lg transition-all transform hover:scale-105"
              >
                💾 Save Booking
              </button>
            </div>
          </div>
        )}

        {currentPage === 'history' && (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-center mb-8">📋 Booking History</h1>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="🔍 Search by guest name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-5 text-lg rounded-xl border-2 border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:outline-none"
              />
              
              <div>
                <label className="block text-lg font-semibold mb-2">Filter by Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full p-5 text-lg rounded-xl border-2 border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <button
                onClick={exportBookingsToExcel}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-lg transition-colors"
              >
                📥 Export to Excel
              </button>
            </div>
            
            <div className="space-y-4">
              {filteredBookings.map(b => (
                <div key={b.id} className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                  <h2 className="text-2xl font-bold mb-3">{b.guestName}</h2>
                  <div className="text-lg mb-2">🏨 Room {b.roomId}</div>
                  <div className="text-lg mb-2">💰 ₹{b.amount} | Advance ₹{b.advance}</div>
                  <div className="text-lg mb-4">📅 {b.checkIn} ➡ {b.checkOut}</div>
                  <div className="text-lg mb-4">👥 {b.guests} Guest{b.guests > 1 ? 's' : ''}</div>
                  
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={() => downloadInvoice(b)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-semibold transition-colors"
                    >
                      📄 Download Invoice
                    </button>
                    {user.uid === ADMIN_UID && (
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl text-lg font-semibold transition-colors"
                      >
                        🗑️ Delete Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredBookings.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">😔</div>
                  <p className="text-xl text-gray-500">No bookings found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 shadow-2xl">
        <div className="grid grid-cols-4 h-20">
          <button 
            onClick={() => setCurrentPage('dashboard')} 
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              currentPage === 'dashboard' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-semibold">Home</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('booking')} 
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              currentPage === 'booking' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <span className="text-2xl">➕</span>
            <span className="text-xs font-semibold">Book</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('history')} 
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              currentPage === 'history' ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <span className="text-2xl">📋</span>
            <span className="text-xs font-semibold">History</span>
          </button>
          
          <button 
            onClick={handleLogout} 
            className="flex flex-col items-center justify-center space-y-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <span className="text-2xl">🚪</span>
            <span className="text-xs font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
