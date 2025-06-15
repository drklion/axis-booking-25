import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const initialInventory = {
  Athena: [],
  Thalia: [],
  Stefani: []
};

export default function App() {
  const today = new Date();

  const [boat, setBoat] = useState("");
  const [bookingType, setBookingType] = useState("");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [captain, setCaptain] = useState("no");
  const [departure, setDeparture] = useState("");
  const [info, setInfo] = useState({ name: "", phone: "", email: "", country: "", address: "", city: "", state: "", zip: "", transferFrom: "", transferTo: "" });
  const [inventory, setInventory] = useState(initialInventory);

  const boatNames = {
    Axopar: "Axopar 37XC 11.7 Meter (w/Captain)",
    Axopar25: "Axopar 25 T-Top",
    "5m": "5 Meter 30HP (50HP) Boat Rental"
  };

  const isTimeSlotAvailable = (boatName, newStart, duration) => {
    const bookings = inventory[boatName];
    const newEnd = newStart + duration * 60;
    return bookings.every(([start, end]) => newEnd <= start || newStart >= end);
  };

  const handleBooking = () => {
    if (boat === "5m" || boat === "Axopar25") {
      const duration = bookingType === "Full Day Charter" ? 8 : 4;
      const [hour, min] = time.split(":" ).map(Number);
      const start = hour * 60 + min;
      const availableBoat = Object.keys(inventory).find(name => isTimeSlotAvailable(name, start, duration));

      if (availableBoat) {
        const newEnd = start + duration * 60;
        setInventory(prev => ({
          ...prev,
          [availableBoat]: [...prev[availableBoat], [start, newEnd]]
        }));
        return availableBoat;
      } else {
        alert("No available boats at that time.");
        return null;
      }
    }
    return null;
  };

  const getPriceSummary = () => {
    if (!boat) return "";
    if (bookingType === "Transfer") return "Contact for further info";
    const month = date ? new Date(date).getMonth() : null;

    if (boat === "Axopar25") {
      let basePrice = 0;
      if (bookingType === "Full Day Charter") {
        if (month === 5) basePrice = 250;
        else if (month === 6) basePrice = 300;
        else if (month === 7) basePrice = 350;
      } else if (bookingType === "Half Day Charter") {
        if (month === 5) basePrice = 200;
        else if (month === 6) basePrice = 250;
        else if (month === 7) basePrice = 300;
      }
      if (captain === "yes") basePrice += 100;
      return `€${basePrice} (€100 Fixed Deposit)`;
    }

    if (boat === "5m") {
      let basePrice = 110;
      if (month === 6) basePrice = 120;
      else if (month === 7) basePrice = 130;
      if (captain === "yes") basePrice += 100;
      return `€${basePrice} (€40 Fixed Deposit)`;
    }

    if (boat === "Axopar") {
      if (bookingType === "Full Day Charter") return "€1,450 (30% = €435)";
      if (bookingType === "Half Day Charter") return "€1,100 (30% = €330)";
    }
    return "";
  };

  const sendEmail = () => {
    const summary = `Boat: ${boat ? boatNames[boat] : ""}
Booking Type: ${bookingType}
Date: ${date ? date.toLocaleDateString() : ""}
Time: ${time}
Passengers: ${passengers}
Captain: ${(boat === "5m" || boat === "Axopar25") ? captain : "Included"}
Departure: ${boat === "Axopar" ? departure : "N/A"}
Payment: ${getPriceSummary()}
Transfer: ${bookingType === "Transfer" ? `From ${info.transferFrom} to ${info.transferTo}` : "N/A"}
Address: ${[info.country, info.address, info.city, info.state, info.zip].filter(Boolean).join(" ")}`;

    fetch("https://formsubmit.co/ajax/info@axisyachtcharters.com", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: info.name,
        email: info.email,
        message: summary
      })
    })
    .then(response => response.json())
    .then(data => console.log("Email sent:", data))
    .catch(error => console.error("Error sending email:", error));
  };

  const handleSubmit = () => {
    const assignedBoat = handleBooking();
    if (!assignedBoat && (boat === "5m" || boat === "Axopar25")) return;

    sendEmail();
    alert("Booking submitted. Stripe will open in a new tab.");

    if (boat === "Axopar") {
      if (bookingType === "Full Day Charter") window.open("https://buy.stripe.com/cNi3cu3EVf5G1m2aKHak003", "_blank");
      else if (bookingType === "Half Day Charter") window.open("https://buy.stripe.com/eVq4gygrH4r25Cig51ak004", "_blank");
    } else if (boat === "5m") {
      window.open("https://buy.stripe.com/6oU9AS0sJcXy3ua9GDak005", "_blank");
    } else if (boat === "Axopar25") {
      window.open("https://buy.stripe.com/6oUbJ06R76za8Ouf0Xak006", "_blank");
    }
  };

  const showCaptain = boat === "5m" || boat === "Axopar25";
  const showTransferFields = bookingType === "Transfer";
  const maxPassengers = boat === "Axopar" ? 8 : boat === "5m" ? 5 : "";
  const inputClass = "p-2 border rounded w-full";
  const fullWidth = "w-full sm:w-[300px]";

  const generateTimeOptions = () => {
    const options = [];
    for (let h = 8; h <= 12; h++) {
      options.push(`${String(h).padStart(2, '0')}:00`);
      if (h < 12) options.push(`${String(h).padStart(2, '0')}:30`);
    }
    return options;
  };

  const generatePassengerOptions = () => {
    const limit = maxPassengers || 8;
    const options = [];
    for (let i = 1; i <= limit; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {/* ... other elements remain the same ... */}

      <div className="border-t pt-4">
        <p className="font-semibold text-lg mb-2">Booking Summary</p>
        <ul className="space-y-1">
          {info.name && <li><strong>Name:</strong> {info.name}</li>}
          {info.phone && <li><strong>Phone:</strong> {info.phone}</li>}
          {boat && <li><strong>Boat:</strong> {boatNames[boat]}</li>}
          {bookingType && <li><strong>Booking Type:</strong> {bookingType}</li>}
          {boat === "Axopar" && departure && <li><strong>Departure:</strong> {departure}</li>}
          {date && <li><strong>Date:</strong> {date.toLocaleDateString()}</li>}
          {time && <li><strong>Time:</strong> {time}</li>}
          {passengers && <li><strong>Passengers:</strong> {passengers}</li>}
          {(boat === "5m" || boat === "Axopar25") && <li><strong>Captain:</strong> {captain === "yes" ? "Yes" : "No"}</li>}
          {bookingType === "Transfer" && (
            <li><strong>Transfer:</strong> From {info.transferFrom} to {info.transferTo}</li>
          )}
          <li><strong>Payment:</strong> {getPriceSummary()}</li>
        </ul>
      </div>

      {/* ... submit button remains the same ... */}
    </div>
  );
}
