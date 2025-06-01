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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {!user ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">🏨</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Hotel Satyam</h1>
                <p className="text-blue-100">Welcome back! Please sign in to continue.</p>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none"
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">📧</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">🔒</span>
                  </div>
                  
                  <button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Sign In
                  </button>
                  
                  <div className="text-center">
                    <span className="text-gray-500">Don't have an account?</span>
                  </div>
                  
                  <button
                    onClick={handleSignup}
                    className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">🏨</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Hotel Satyam</h1>
                  <p className="text-gray-600 text-sm">Welcome, {user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Today's Bookings</p>
                  <p className="text-3xl font-bold mt-1">{todayBookings.length}</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Available Rooms</p>
                  <p className="text-3xl font-bold mt-1">{availableRooms}</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🛏️</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold mt-1">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-3 text-2xl">➕</span>
              Create New Booking
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <input
                className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none"
                placeholder="Guest Name"
                value={newBooking.guestName}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, guestName: e.target.value })
                }
              />
              
              <select
                className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none"
                value={newBooking.roomId}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, roomId: e.target.value })
                }
              >
                <option value="">Select Room</option>
                {rooms.map((r) => (
                  <option key={r} value={r}>
                    Room {r}
                  </option>
                ))}
              </select>
              
              <div className="relative">
                <input
                  className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none w-full"
                  type="date"
                  value={newBooking.checkIn}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, checkIn: e.target.value })
                  }
                />
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">Check-in</label>
              </div>
              
              <div className="relative">
                <input
                  className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none w-full"
                  type="date"
                  value={newBooking.checkOut}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, checkOut: e.target.value })
                  }
                />
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">Check-out</label>
              </div>
              
              <input
                className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none"
                type="number"
                placeholder="Number of Guests"
                value={newBooking.guests}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, guests: +e.target.value })
                }
              />
              
              <input
                className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none"
                type="number"
                placeholder="Total Amount (₹)"
                value={newBooking.amount}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, amount: +e.target.value })
                }
              />
              
              <input
                className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none sm:col-span-1"
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
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Create Booking
            </button>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="mr-3 text-2xl">📋</span>
                Recent Bookings ({today})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                  <tr>
                    <th className="px-4 py-4 text-left font-semibold">Guest</th>
                    <th className="px-4 py-4 text-left font-semibold">Room</th>
                    <th className="px-4 py-4 text-left font-semibold hidden sm:table-cell">Check-in</th>
                    <th className="px-4 py-4 text-left font-semibold hidden sm:table-cell">Check-out</th>
                    <th className="px-4 py-4 text-left font-semibold hidden md:table-cell">Guests</th>
                    <th className="px-4 py-4 text-left font-semibold">Amount</th>
                    <th className="px-4 py-4 text-left font-semibold hidden sm:table-cell">Advance</th>
                    <th className="px-4 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <span className="text-4xl mb-2">📋</span>
                          <p>No bookings found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{b.guestName}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {b.roomId}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-600 hidden sm:table-cell">{b.checkIn}</td>
                        <td className="px-4 py-4 text-gray-600 hidden sm:table-cell">{b.checkOut}</td>
                        <td className="px-4 py-4 text-gray-600 hidden md:table-cell">{b.guests}</td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-green-600">₹{b.amount}</span>
                        </td>
                        <td className="px-4 py-4 text-gray-600 hidden sm:table-cell">₹{b.advance}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => downloadInvoice(b)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                              📄 Invoice
                            </button>
                            {user.uid === ADMIN_UID && (
                              <button
                                onClick={() => handleDelete(b.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
