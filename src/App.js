import React, { useEffect, useState } from "react";
import { auth, db, ref, set, onValue, remove } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ADMIN_UID = "mZFDI5RBWSTR43r6kBIAGvXf80t1";

const App = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [newBooking, setNewBooking] = useState({
    guestName: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    amount: 0,
  });

  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
    onValue(ref(db, "bookings"), (snapshot) => {
      const data = snapshot.val();
      setBookings(data ? Object.values(data) : []);
    });
  }, []);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(alert);
  };

  const handleLogout = () => signOut(auth);

  const handleBooking = () => {
    const id = Date.now();
    set(ref(db, "bookings/" + id), { ...newBooking, id });
    setNewBooking({
      guestName: "",
      roomId: "",
      checkIn: "",
      checkOut: "",
      guests: 1,
      amount: 0,
    });
  };

  const handleDelete = (id) => {
    remove(ref(db, "bookings/" + id));
  };

  const downloadInvoice = (booking) => {
    const doc = new jsPDF();
    doc.text("Hotel Satyam - Booking Invoice", 14, 20);
    doc.autoTable({
      startY: 30,
      head: [["Field", "Details"]],
      body: [
        ["Guest", booking.guestName],
        ["Room", booking.roomId],
        ["Check-in", booking.checkIn],
        ["Check-out", booking.checkOut],
        ["Guests", booking.guests],
        ["Amount", "₹" + booking.amount],
      ],
    });
    doc.save(`Invoice_${booking.guestName}.pdf`);
  };

  const today = new Date().toISOString().split("T")[0];
  const currentGuests = bookings.filter((b) => today >= b.checkIn && today < b.checkOut);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="p-6 font-sans bg-gray-100 min-h-screen">
      {!user ? (
        <div className="max-w-md mx-auto mt-20 text-center bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Login to Hotel Satyam</h2>
          <button
            onClick={signInWithGoogle}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign in with Google
          </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Welcome, {user.displayName || user.email}</h1>
            <button
              onClick={handleLogout}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow text-center">
              <p className="text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <p className="text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{totalRevenue}</p>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <p className="text-gray-600">Guests Checked In Today</p>
              <p className="text-2xl font-bold text-blue-600">{currentGuests.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Create a Booking</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                className="border p-2 rounded"
                placeholder="Guest Name"
                value={newBooking.guestName}
                onChange={(e) => setNewBooking({ ...newBooking, guestName: e.target.value })}
              />
              <input
                className="border p-2 rounded"
                placeholder="Room ID"
                value={newBooking.roomId}
                onChange={(e) => setNewBooking({ ...newBooking, roomId: e.target.value })}
              />
              <input
                className="border p-2 rounded"
                type="date"
                value={newBooking.checkIn}
                onChange={(e) => setNewBooking({ ...newBooking, checkIn: e.target.value })}
              />
              <input
                className="border p-2 rounded"
                type="date"
                value={newBooking.checkOut}
                onChange={(e) => setNewBooking({ ...newBooking, checkOut: e.target.value })}
              />
              <input
                className="border p-2 rounded"
                type="number"
                min="1"
                placeholder="Guests"
                value={newBooking.guests}
                onChange={(e) => setNewBooking({ ...newBooking, guests: +e.target.value })}
              />
              <input
                className="border p-2 rounded"
                type="number"
                placeholder="Amount (₹)"
                value={newBooking.amount}
                onChange={(e) => setNewBooking({ ...newBooking, amount: +e.target.value })}
              />
            </div>
            <button
              onClick={handleBooking}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Booking
            </button>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">All Bookings</h2>
            {bookings.length === 0 ? (
              <p>No bookings yet.</p>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="border-b py-2">
                  <p><strong>{b.guestName}</strong> - Room {b.roomId}</p>
                  <p>{b.checkIn} to {b.checkOut} - {b.guests} guest(s) - ₹{b.amount}</p>
                  <div className="mt-1 flex gap-2">
                    <button
                      onClick={() => downloadInvoice(b)}
                      className="text-sm text-blue-600 underline"
                    >
                      Download Invoice
                    </button>
                    {user.uid === ADMIN_UID && (
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-sm text-red-600 underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
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
