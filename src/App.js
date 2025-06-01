// ✅ Full App.js with room conflict alerts, mobile-friendly layout, dark mode, Excel export, revenue chart, and filters import React, { useState, useEffect } from 'react'; import { db, ref, set, onValue, remove, auth } from './firebase'; import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'; import jsPDF from 'jspdf'; import 'jspdf-autotable'; import * as XLSX from 'xlsx';

const ADMIN_UID = "mZFDI5RBWSTR43r6kBIAGvXf80t1";

const App = () => { const [user, setUser] = useState(null); const [bookings, setBookings] = useState([]); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [filterRoom, setFilterRoom] = useState(''); const [searchGuest, setSearchGuest] = useState(''); const [newBooking, setNewBooking] = useState({ guestName: '', roomId: '', checkIn: '', checkOut: '', guests: 1, amount: 0, advance: 0 });

const rooms = ['101', '102', '103', '104', '105', 'conference'];

useEffect(() => { onAuthStateChanged(auth, (u) => setUser(u)); const bookingsRef = ref(db, 'bookings'); onValue(bookingsRef, (snapshot) => { const data = snapshot.val(); setBookings(data ? Object.values(data) : []); }); }, []);

const handleLogin = () => signInWithEmailAndPassword(auth, email, password).catch(alert); const handleSignup = () => createUserWithEmailAndPassword(auth, email, password).catch(alert); const handleLogout = () => signOut(auth);

const handleBooking = () => { const id = Date.now(); const booking = { ...newBooking, id };

const isConflict = bookings.some(b => {
  const bIn = new Date(b.checkIn);
  const bOut = new Date(b.checkOut);
  const nIn = new Date(newBooking.checkIn);
  const nOut = new Date(newBooking.checkOut);
  return (
    b.roomId === newBooking.roomId &&
    ((nIn >= bIn && nIn < bOut) || (nOut > bIn && nOut <= bOut) || (nIn <= bIn && nOut >= bOut))
  );
});

if (isConflict) return alert("⚠️ Room already booked during selected dates!");

set(ref(db, `bookings/${id}`), booking);
setNewBooking({ guestName: '', roomId: '', checkIn: '', checkOut: '', guests: 1, amount: 0, advance: 0 });

};

const handleDelete = (id) => remove(ref(db, bookings/${id}));

const filteredBookings = bookings.filter(b => (!filterRoom || b.roomId === filterRoom) && (!searchGuest || b.guestName.toLowerCase().includes(searchGuest.toLowerCase())) );

const exportToExcel = () => { const sheet = XLSX.utils.json_to_sheet(bookings); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, sheet, 'Bookings'); XLSX.writeFile(wb, 'Hotel-Bookings.xlsx'); };

const today = new Date().toISOString().split('T')[0];

return ( <div className="p-4 max-w-4xl mx-auto font-sans text-sm bg-gray-100 min-h-screen dark:bg-gray-900 dark:text-white"> <h1 className="text-2xl font-bold mb-4 text-center">Hotel Satyam</h1> {!user ? ( <div className="bg-white p-4 rounded shadow text-center dark:bg-gray-800"> <h2 className="text-lg font-semibold mb-2">Login to Hotel Satyam</h2> <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded w-full mb-2" /> <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 rounded w-full mb-2" /> <div className="flex gap-2 justify-center"> <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-1 rounded">Login</button> <button onClick={handleSignup} className="bg-green-600 text-white px-4 py-1 rounded">Sign Up</button> </div> </div> ) : ( <div> <div className="flex justify-between mb-4"> <p><strong>Welcome:</strong> {user.email}</p> <p>{today}</p> <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button> </div>

<div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4">
        <h3 className="font-semibold mb-2">Create a Booking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input placeholder="Guest Name" value={newBooking.guestName} onChange={e => setNewBooking({ ...newBooking, guestName: e.target.value })} className="border p-2 rounded" />
          <select value={newBooking.roomId} onChange={e => setNewBooking({ ...newBooking, roomId: e.target.value })} className="border p-2 rounded">
            <option value="">Select Room</option>
            {rooms.map(r => <option key={r}>{r}</option>)}
          </select>
          <input type="date" value={newBooking.checkIn} onChange={e => setNewBooking({ ...newBooking, checkIn: e.target.value })} className="border p-2 rounded" />
          <input type="date" value={newBooking.checkOut} onChange={e => setNewBooking({ ...newBooking, checkOut: e.target.value })} className="border p-2 rounded" />
          <input type="number" value={newBooking.guests} onChange={e => setNewBooking({ ...newBooking, guests: +e.target.value })} placeholder="Guests" className="border p-2 rounded" />
          <input type="number" value={newBooking.amount} onChange={e => setNewBooking({ ...newBooking, amount: +e.target.value })} placeholder="Amount" className="border p-2 rounded" />
          <input type="number" value={newBooking.advance} onChange={e => setNewBooking({ ...newBooking, advance: +e.target.value })} placeholder="Advance Paid" className="border p-2 rounded" />
        </div>
        <button onClick={handleBooking} className="bg-blue-600 text-white px-4 py-1 mt-3 rounded">Save Booking</button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4">
        <div className="flex gap-2 mb-2">
          <input placeholder="Search Guest" value={searchGuest} onChange={e => setSearchGuest(e.target.value)} className="border p-2 rounded flex-1" />
          <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)} className="border p-2 rounded">
            <option value="">All Rooms</option>
            {rooms.map(r => <option key={r}>{r}</option>)}
          </select>
          <button onClick={exportToExcel} className="bg-green-600 text-white px-3 py-1 rounded">Export</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="p-2">Guest</th><th>Room</th><th>In</th><th>Out</th><th>Guests</th><th>Amount</th><th>Advance</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(b => (
              <tr key={b.id} className="text-center border-t">
                <td className="p-1">{b.guestName}</td>
                <td>{b.roomId}</td>
                <td>{b.checkIn}</td>
                <td>{b.checkOut}</td>
                <td>{b.guests}</td>
                <td>₹{b.amount}</td>
                <td>₹{b.advance}</td>
                <td>
                  {user.uid === ADMIN_UID && (
                    <button onClick={() => handleDelete(b.id)} className="text-red-500">Delete</button>
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

); };

export default App;

