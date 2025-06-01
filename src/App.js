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
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editingInvoice, setEditingInvoice] = useState(null);
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

  const isRoomConflict = (roomId, checkIn, checkOut, excludeId = null) => {
    return bookings.some((b) => {
      return (
        b.id !== excludeId &&
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

    if (!newBooking.guestName || !roomId || !checkIn || !checkOut) {
      alert('Please fill all required fields.');
      return;
    }

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
    alert('Booking created successfully!');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      remove(ref(db, `bookings/${id}`));
    }
  };

  const handleEditBooking = (booking) => {
    const { roomId, checkIn, checkOut } = booking;
    
    if (isRoomConflict(roomId, checkIn, checkOut, booking.id)) {
      alert('Room already booked for selected dates.');
      return;
    }

    set(ref(db, `bookings/${booking.id}`), booking);
    setEditingInvoice(null);
    alert('Booking updated successfully!');
  };

  const downloadInvoice = (b) => {
    const doc = new jsPDF();
    
    // Hotel Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text("Hotel Satyam", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text("Booking Invoice", 105, 30, { align: 'center' });
    
    // Invoice details
    doc.autoTable({
      startY: 40,
      head: [["Field", "Details"]],
      body: [
        ["Guest Name", b.guestName],
        ["Room Number", b.roomId],
        ["Check-in Date", b.checkIn],
        ["Check-out Date", b.checkOut],
        ["Number of Guests", b.guests],
        ["Total Amount", "₹" + b.amount],
        ["Advance Paid", "₹" + b.advance],
        ["Balance Due", "₹" + (b.amount - b.advance)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    doc.save(`Invoice_${b.guestName}_${b.roomId}.pdf`);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.checkIn === today);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
  const availableRooms = 6 - todayBookings.length;

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
              <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">🏨</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Hotel Satyam</h1>
              <p className="text-blue-100 text-lg">Management System</p>
            </div>
            
            <div className="p-8 space-y-6">
              <input
                className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none"
                type="email"
                placeholder="📧 Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              <input
                className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none"
                type="password"
                placeholder="🔒 Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Sign In
              </button>
              
              <div className="text-center text-gray-500 text-lg">
                Need an account?
              </div>
              
              <button
                onClick={handleSignup}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-200 transition-all"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Page
  if (currentPage === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🏨</span>
              <div>
                <h1 className="text-2xl font-bold">Hotel Satyam</h1>
                <p className="text-blue-100 text-lg">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium text-lg"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-lg font-medium">Today's Bookings</p>
                  <p className="text-4xl font-bold mt-2">{todayBookings.length}</p>
                </div>
                <span className="text-4xl">📅</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-lg font-medium">Available Rooms</p>
                  <p className="text-4xl font-bold mt-2">{availableRooms}</p>
                </div>
                <span className="text-4xl">🛏️</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-lg font-medium">Total Revenue</p>
                  <p className="text-4xl font-bold mt-2">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <span className="text-4xl">💰</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-3 text-3xl">➕</span>
              New Booking
            </h2>
            
            <div className="space-y-4">
              <input
                className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none"
                placeholder="Guest Name *"
                value={newBooking.guestName}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, guestName: e.target.value })
                }
              />
              
              <select
                className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none"
                value={newBooking.roomId}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, roomId: e.target.value })
                }
              >
                <option value="">Select Room *</option>
                {rooms.map((r) => (
                  <option key={r} value={r}>
                    Room {r}
                  </option>
                ))}
              </select>
              
              <div>
                <label className="block text-gray-600 text-lg font-medium mb-2">Check-in Date *</label>
                <input
                  className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none"
                  type="date"
                  value={newBooking.checkIn}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, checkIn: e.target.value })
                  }
                />
              </div>
              
              <div>
                <label className="block text-gray-600 text-lg font-medium mb-2">Check-out Date *</label>
                <input
                  className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none"
                  type="date"
                  value={newBooking.checkOut}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, checkOut: e.target.value })
                  }
                />
              </div>
              
              <input
                className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none"
                type="number"
                placeholder="Number of Guests"
                value={newBooking.guests}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, guests: +e.target.value })
                }
              />
              
              <input
                className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none"
                type="number"
                placeholder="Total Amount (₹)"
                value={newBooking.amount}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, amount: +e.target.value })
                }
              />
              
              <input
                className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none"
                type="number"
                placeholder="Advance Payment (₹)"
                value={newBooking.advance}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, advance: +e.target.value })
                }
              />
            </div>
            
            <button
              onClick={handleBooking}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-xl hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Create Booking
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex justify-around">
            <button
              className="flex flex-col items-center p-3 bg-blue-100 text-blue-600 rounded-2xl"
              onClick={() => setCurrentPage('dashboard')}
            >
              <span className="text-2xl mb-1">🏠</span>
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <button
              className="flex flex-col items-center p-3 text-gray-400"
              onClick={() => setCurrentPage('history')}
            >
              <span className="text-2xl mb-1">📋</span>
              <span className="text-sm font-medium">History</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Booking History Page
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 sticky top-0 z-10">
        <h1 className="text-2xl font-bold flex items-center">
          <span className="mr-3 text-3xl">📋</span>
          Booking History
        </h1>
        <p className="text-blue-100 text-lg mt-1">{bookings.length} total bookings</p>
      </div>

      {/* Edit Invoice Modal */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">Edit Booking</h3>
            
            <div className="space-y-4">
              <input
                className="w-full px-4 py-3 text-lg bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                placeholder="Guest Name"
                value={editingInvoice.guestName}
                onChange={(e) => setEditingInvoice({...editingInvoice, guestName: e.target.value})}
              />
              
              <select
                className="w-full px-4 py-3 text-lg bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                value={editingInvoice.roomId}
                onChange={(e) => setEditingInvoice({...editingInvoice, roomId: e.target.value})}
              >
                {rooms.map((r) => (
                  <option key={r} value={r}>Room {r}</option>
                ))}
              </select>
              
              <input
                className="w-full px-4 py-3 text-lg bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                type="date"
                value={editingInvoice.checkIn}
                onChange={(e) => setEditingInvoice({...editingInvoice, checkIn: e.target.value})}
              />
              
              <input
                className="w-full px-4 py-3 text-lg bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                type="date"
                value={editingInvoice.checkOut}
                onChange={(e) => setEditingInvoice({...editingInvoice, checkOut: e.target.value})}
              />
              
              <input
                className="w-full px-4 py-3 text-lg bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                type="number"
                placeholder="Guests"
                value={editingInvoice.guests}
                onChange={(e) => setEditingInvoice({...editingInvoice, guests: +e.target.value})}
              />
              
              <input
                className="w-full px-4 py-3 text-lg bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                type="number"
                placeholder="Amount"
                value={editingInvoice.amount}
                onChange={(e) => setEditingInvoice({...editingInvoice, amount: +e.target.value})}
              />
              
              <input
                className="w-full px-4 py-3 text-lg bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                type="number"
                placeholder="Advance"
                value={editingInvoice.advance}
                onChange={(e) => setEditingInvoice({...editingInvoice, advance: +e.target.value})}
              />
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleEditBooking(editingInvoice)}
                className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-lg"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingInvoice(null)}
                className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-bold text-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">📋</span>
            <p className="text-gray-500 text-xl">No bookings found</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{booking.guestName}</h3>
                  <p className="text-lg text-blue-600 font-semibold">Room {booking.roomId}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-lg font-medium">
                  ₹{booking.amount}
                </span>
              </div>
              
              <div className="space-y-2 text-lg text-gray-600">
                <p><span className="font-medium">Check-in:</span> {booking.checkIn}</p>
                <p><span className="font-medium">Check-out:</span> {booking.checkOut}</p>
                <p><span className="font-medium">Guests:</span> {booking.guests}</p>
                <p><span className="font-medium">Advance:</span> ₹{booking.advance}</p>
                <p><span className="font-medium">Balance:</span> ₹{booking.amount - booking.advance}</p>
              </div>
              
    
