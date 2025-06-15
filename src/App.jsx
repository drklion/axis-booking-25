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
  const [info, setInfo] = useState({ name: "", phone: "", email: "", country: "", address: "", city: "", state: "", zip: "", transferFrom: "", transferTo: "" });
  const [inventory, setInventory] = useState(initialInventory);

  const boatNames = {
    Axopar: "Axopar 37XC 11.7 Meter (w/Captain)",
    "5m": "5 Meter 30HP (50HP) Boat Rental"
  };

  const isTimeSlotAvailable = (boatName, newStart, duration) => {
    const bookings = inventory[boatName];
    const newEnd = newStart + duration * 60;
    return bookings.every(([start, end]) => newEnd <= start || newStart >= end);
  };

  const handleBooking = () => {
    if (boat === "5m") {
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
        alert("No available 5m boats at that time.");
        return null;
      }
    }
    return null;
  };

  const getPriceSummary = () => {
    if (!boat) return "";
    if (bookingType === "Transfer") return "Contact for further info";
    if (boat === "Axopar") {
      if (bookingType === "Full Day Charter") return "€1,450 (30% = €435)";
      if (bookingType === "Half Day Charter") return "€1,100 (30% = €330)";
    }
    if (boat === "5m") {
      let month = date ? new Date(date).getMonth() : null;
      let basePrice = 110;
      if (month === 6) basePrice = 120;
      else if (month === 7) basePrice = 130;
      if (captain === "yes") basePrice += 100;
      return `€${basePrice} (€40 Fixed Deposit)`;
    }
    return "";
  };

  const sendEmail = () => {
    const summary = `Boat: ${boat ? boatNames[boat] : ""}\nBooking Type: ${bookingType}\nDate: ${date ? date.toLocaleDateString() : ""}\nTime: ${time}\nPassengers: ${passengers}\nCaptain: ${boat === "5m" ? captain : "Included"}\nPayment: ${getPriceSummary()}\nTransfer: ${bookingType === "Transfer" ? `From ${info.transferFrom} to ${info.transferTo}` : "N/A"}\nAddress: ${[info.country, info.address, info.city, info.state, info.zip].filter(Boolean).join(" ")}`;

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
    if (!assignedBoat && boat === "5m") return;

    sendEmail();
    alert("Booking submitted. Stripe will open in a new tab.");

    if (boat === "Axopar") {
      if (bookingType === "Full Day Charter") window.open("https://buy.stripe.com/cNi3cu3EVf5G1m2aKHak003", "_blank");
      else if (bookingType === "Half Day Charter") window.open("https://buy.stripe.com/eVq4gygrH4r25Cig51ak004", "_blank");
    } else if (boat === "5m") {
      window.open("https://buy.stripe.com/6oU9AS0sJcXy3ua9GDak005", "_blank");
    }
  };

  const showCaptain = boat === "5m";
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
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Axis Yacht Charters</h1>
        <p className="text-lg italic">Free to Explore</p>
      </div>

      <div>
        <label className="block font-semibold mb-1">Choose a Boat:</label>
        <select value={boat} onChange={(e) => setBoat(e.target.value)} className={inputClass}>
          <option value="">Choose</option>
          <option value="Axopar">Axopar 37XC 11.7 Meter (w/Captain)</option>
          <option value="5m">5 Meter 30HP (50HP) Boat Rental</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Booking Type:</label>
        <select value={bookingType} onChange={(e) => setBookingType(e.target.value)} className={inputClass}>
          <option value="">Select</option>
          <option value="Full Day Charter">Full Day Charter</option>
          <option value="Half Day Charter">Half Day Charter</option>
          <option value="Transfer">Transfer</option>
        </select>
      </div>

      {showTransferFields && (
        <div className="grid sm:grid-cols-2 gap-4">
          <input placeholder="Transfer From" value={info.transferFrom} onChange={(e) => setInfo({ ...info, transferFrom: e.target.value })} className={inputClass} />
          <input placeholder="Transfer To" value={info.transferTo} onChange={(e) => setInfo({ ...info, transferTo: e.target.value })} className={inputClass} />
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Select Date:</label>
          <DatePicker selected={date} onChange={setDate} minDate={today} className={inputClass} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Select Time:</label>
          <select value={time} onChange={(e) => setTime(e.target.value)} className={inputClass}>
            <option value="">Select Time</option>
            {generateTimeOptions().map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Passengers:</label>
          <select value={passengers} onChange={(e) => setPassengers(e.target.value)} className={inputClass}>
            {generatePassengerOptions()}
          </select>
        </div>
        {showCaptain && (
          <div>
            <label className="block font-semibold mb-1">Captain:</label>
            <select value={captain} onChange={(e) => setCaptain(e.target.value)} className={inputClass}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <input placeholder="Full Name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} className={inputClass} />
        <input placeholder="Phone" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} className={inputClass} />
        <input placeholder="Email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} className={inputClass} />
        <input placeholder="Country" value={info.country} onChange={(e) => setInfo({ ...info, country: e.target.value })} className={inputClass} />
        <input placeholder="Address" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} className={inputClass} />
        <input placeholder="City" value={info.city} onChange={(e) => setInfo({ ...info, city: e.target.value })} className={inputClass} />
        <input placeholder="State" value={info.state} onChange={(e) => setInfo({ ...info, state: e.target.value })} className={inputClass} />
        <input placeholder="ZIP" value={info.zip} onChange={(e) => setInfo({ ...info, zip: e.target.value })} className={inputClass} />
      </div>

     <div className="border-t pt-4">
  <p className="font-semibold text-lg mb-2">Booking Summary</p>
  <ul className="space-y-1">
  {info.name && <li><strong>Name:</strong> {info.name}</li>}
  {info.phone && <li><strong>Phone:</strong> {info.phone}</li>}
  {boat && <li><strong>Boat:</strong> {boatNames[boat]}</li>}
  {bookingType && <li><strong>Booking Type:</strong> {bookingType}</li>}
  {date && <li><strong>Date:</strong> {date.toLocaleDateString()}</li>}
  {time && <li><strong>Time:</strong> {time}</li>}
  {passengers && <li><strong>Passengers:</strong> {passengers}</li>}
  {boat === "5m" && <li><strong>Captain:</strong> {captain === "yes" ? "Yes" : "No"}</li>}
  {bookingType === "Transfer" && (
    <li><strong>Transfer:</strong> From {info.transferFrom} to {info.transferTo}</li>
  )}
  <li><strong>Payment:</strong> {getPriceSummary()}</li>
</ul>
       
</div>
      <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        Submit Booking
      </button>
    </div>
  );
}
