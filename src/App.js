<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hotel Booking System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            text-align: center;
            padding: 40px 20px;
        }

        .header h1 {
            font-size: 3.5rem;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            font-size: 1.8rem;
            opacity: 0.9;
        }

        .booking-form {
            padding: 40px;
            background: #f8f9fa;
        }

        .form-title {
            font-size: 2.5rem;
            color: #333;
            margin-bottom: 30px;
            text-align: center;
            font-weight: bold;
        }

        .form-group {
            margin-bottom: 25px;
        }

        .form-group label {
            display: block;
            font-size: 1.4rem;
            font-weight: bold;
            color: #555;
            margin-bottom: 8px;
        }

        .form-group input,
        .form-group select {
            width: 100%;
            padding: 15px;
            font-size: 1.2rem;
            border: 2px solid #ddd;
            border-radius: 10px;
            transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #4CAF50;
            box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .book-btn {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 18px 40px;
            font-size: 1.4rem;
            font-weight: bold;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .book-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(76, 175, 80, 0.4);
        }

        .calendar-section {
            padding: 40px;
            background: white;
        }

        .calendar-title {
            font-size: 2.5rem;
            color: #333;
            margin-bottom: 30px;
            text-align: center;
            font-weight: bold;
        }

        .calendar-container {
            max-width: 900px;
            margin: 0 auto;
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding: 0 20px;
        }

        .month-year {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
        }

        .nav-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 18px;
            font-size: 1.2rem;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.3s;
        }

        .nav-btn:hover {
            background: #45a049;
        }

        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
            background: #ddd;
            border-radius: 10px;
            overflow: hidden;
        }

        .day-header {
            background: #4CAF50;
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 1.2rem;
            font-weight: bold;
        }

        .day-cell {
            background: white;
            padding: 15px;
            min-height: 100px;
            border: 1px solid #eee;
            position: relative;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .day-cell:hover {
            background: #f0f8ff;
        }

        .day-number {
            font-size: 1.2rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
        }

        .booked-room {
            background: #ff4757;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.9rem;
            margin: 2px 0;
            display: block;
            text-align: center;
        }

        .available-room {
            background: #2ed573;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.9rem;
            margin: 2px 0;
            display: block;
            text-align: center;
        }

        .legend {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 30px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.2rem;
        }

        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 4px;
        }

        .booked-color {
            background: #ff4757;
        }

        .available-color {
            background: #2ed573;
        }

        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2.5rem;
            }
            
            .header p {
                font-size: 1.4rem;
            }
            
            .calendar-grid {
                font-size: 0.8rem;
            }
            
            .day-cell {
                min-height: 80px;
                padding: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏨 Grand Hotel Booking</h1>
            <p>Your Perfect Stay Awaits</p>
        </div>

        <div class="booking-form">
            <h2 class="form-title">Book Your Room</h2>
            <form id="booking-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="checkin">Check-in Date</label>
                        <input type="date" id="checkin" name="checkin" required>
                    </div>
                    <div class="form-group">
                        <label for="checkout">Check-out Date</label>
                        <input type="date" id="checkout" name="checkout" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="guests">Number of Guests</label>
                        <select id="guests" name="guests" required>
                            <option value="">Select Guests</option>
                            <option value="1">1 Guest</option>
                            <option value="2">2 Guests</option>
                            <option value="3">3 Guests</option>
                            <option value="4">4 Guests</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="room-type">Room Type</label>
                        <select id="room-type" name="room-type" required>
                            <option value="">Select Room Type</option>
                            <option value="standard">Standard Room</option>
                            <option value="deluxe">Deluxe Room</option>
                            <option value="suite">Suite</option>
                            <option value="presidential">Presidential Suite</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" name="name" placeholder="Enter your full name" required>
                </div>

                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email address" required>
                </div>

                <button type="submit" class="book-btn">🔒 BOOK NOW</button>
            </form>
        </div>

        <div class="calendar-section">
            <h2 class="calendar-title">📅 Room Availability Calendar</h2>
            
            <div class="calendar-container">
                <div class="calendar-header">
                    <button class="nav-btn" onclick="previousMonth()">‹ Previous</button>
                    <span class="month-year" id="month-year"></span>
                    <button class="nav-btn" onclick="nextMonth()">Next ›</button>
                </div>

                <div class="calendar-grid" id="calendar-grid">
                    <!-- Calendar will be generated by JavaScript -->
                </div>

                <div class="legend">
                    <div class="legend-item">
                        <div class="legend-color booked-color"></div>
                        <span>Booked Rooms</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color available-color"></div>
                        <span>Available Rooms</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();

        // Sample booking data - room numbers that are booked for specific dates
        const bookings = {
            '2025-06-05': [101, 102, 205],
            '2025-06-06': [101, 203, 301],
            '2025-06-07': [102, 201, 205],
            '2025-06-10': [101, 102, 203, 301],
            '2025-06-12': [205, 301, 102],
            '2025-06-15': [101, 201, 203],
            '2025-06-18': [102, 205, 301],
            '2025-06-20': [101, 203, 205],
            '2025-06-25': [102, 201, 301],
            '2025-06-28': [101, 205, 203],
            '2025-07-02': [102, 201, 301],
            '2025-07-05': [101, 203, 205],
            '2025-07-08': [102, 201, 301],
            '2025-07-12': [101, 205, 203],
            '2025-07-15': [102, 201, 301],
            '2025-07-20': [101, 203, 205],
            '2025-07-25': [102, 201, 301]
        };

        const totalRooms = [101, 102, 201, 203, 205, 301]; // Available room numbers

        function generateCalendar(month, year) {
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            document.getElementById('month-year').textContent = `${monthNames[month]} ${year}`;
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            let calendarHTML = '';
            
            // Add day headers
            dayNames.forEach(day => {
                calendarHTML += `<div class="day-header">${day}</div>`;
            });
            
            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDay; i++) {
                calendarHTML += '<div class="day-cell"></div>';
            }
            
            // Add days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const bookedRooms = bookings[dateString] || [];
                const availableRooms = totalRooms.filter(room => !bookedRooms.includes(room));
                
                let roomsHTML = '';
                
                // Add booked rooms
                bookedRooms.forEach(room => {
                    roomsHTML += `<span class="booked-room">Room ${room}</span>`;
                });
                
                // Add some available rooms (limit to 2 for display)
                availableRooms.slice(0, 2).forEach(room => {
                    roomsHTML += `<span class="available-room">Room ${room}</span>`;
                });
                
                calendarHTML += `
                    <div class="day-cell">
                        <div class="day-number">${day}</div>
                        ${roomsHTML}
                    </div>
                `;
            }
            
            document.getElementById('calendar-grid').innerHTML = calendarHTML;
        }

        function previousMonth() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            generateCalendar(currentMonth, currentYear);
        }

        function nextMonth() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            generateCalendar(currentMonth, currentYear);
        }

        // Initialize calendar
        generateCalendar(currentMonth, currentYear);

        // Set minimum date for check-in to today
        document.getElementById('checkin').min = new Date().toISOString().split('T')[0];
        document.getElementById('checkout').min = new Date().toISOString().split('T')[0];

        // Handle form submission
        document.getElementById('booking-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Booking request submitted! We will contact you shortly to confirm your reservation.');
        });

        // Update checkout minimum date when checkin changes
        document.getElementById('checkin').addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            checkinDate.setDate(checkinDate.getDate() + 1);
            document.getElementById('checkout').min = checkinDate.toISOString().split('T')[0];
        });
    </script>
</body>
</html>
