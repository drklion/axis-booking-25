import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const initialInventory = {
  Athena: [],
  Thalia: []
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
  const [info, setInfo] = useState({
  name: "",
  phone: "",
  email: "",
  country: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  transferFrom: "",
  transferTo: "",
  agreed: false,                // ✅ added
  agreementTimestamp: ""        // ✅ added
});
  const [inventory, setInventory] = useState(initialInventory);

  const boatNames = {
    Axopar: "Axopar 37XC 11.7 Meter (w/Captain)",
    Axopar22: "Axopar 22 T-Top",
    BlueWater170: "Blue Water 170 5 Meter Rental"
  };
  const isTimeSlotAvailable = (boatName, newStart, duration) => {
    const bookings = inventory[boatName];
    const newEnd = newStart + duration * 60;
    return bookings.every(([start, end]) => newEnd <= start || newStart >= end);
  };

  const handleBooking = () => {
    if (boat === "BlueWater170" || boat === "Axopar22") {
      const duration = bookingType === "Full Day Charter" ? 8 : 4;
      const [hour, min] = time.split(":").map(Number);
      const start = hour * 60 + min;
      const availableBoat = Object.keys(inventory).find(name =>
        isTimeSlotAvailable(name, start, duration)
      );

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

    if (boat === "Axopar22") {
      const fullPrices = [200, 200, 200, 225, 250, 250, 250, 250, 200, 0, 0]; // Jan–Dec
      const halfPrices = [150, 150, 150, 175, 200, 200, 200, 200, 150, 0, 0];
      const basePrice = bookingType === "Full Day Charter" ? fullPrices[month] : halfPrices[month];
      if (basePrice === 0) return "Unavailable this month";
      return `€${captain === "yes" ? basePrice + 100 : basePrice} (€100 Fixed Deposit)`;
    }

    if (boat === "BlueWater170") {
      const fullPrices = [80, 80, 80, 80, 90, 100, 110, 110, 90, 80, 0, 0];
      const halfPrices = [70, 70, 70, 70, 80, 90, 90, 90, 80, 70, 0, 0];
      const basePrice = bookingType === "Full Day Charter" ? fullPrices[month] : halfPrices[month];
      if (basePrice === 0) return "Unavailable this month";
      return `€${captain === "yes" ? basePrice + 100 : basePrice} (€50 Fixed Deposit)`;
    }

    if (boat === "Axopar") {
      return bookingType === "Full Day Charter"
        ? "€1,200 (50% = €600)"
        : "€1,100 (50% = €550)";
    }

    return "";
  };
  const sendEmail = () => {
    const summary = `Boat: ${boat ? boatNames[boat] : ""}
Booking Type: ${bookingType}
Date: ${date ? date.toLocaleDateString() : ""}
Time: ${time}
Passengers: ${passengers}
Captain: ${showCaptain ? (captain === "yes" ? "Yes" : "No") : "Included"}
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
  if (!info.name || !info.phone || !info.email) {
    alert("Please fill in your full name, phone, and email before submitting.");
    return;
  }

  if (!info.agreed) {
    alert("You must agree to the Terms & Conditions before submitting.");
    return;
  }

  const assignedBoat = handleBooking();
  if (!assignedBoat && (boat === "BlueWater170" || boat === "Axopar22")) return;

  sendEmail();
  alert("Booking submitted. Stripe will open in a new tab.");

    const stripeLinks = {
      Axopar: {
        "Full Day Charter": "https://buy.stripe.com/cNi3cu3EVf5G1m2aKHak003",
        "Half Day Charter": "https://buy.stripe.com/eVq4gygrH4r25Cig51ak004"
      },
      BlueWater170: {
        any: "https://buy.stripe.com/3cI8wO5N3aPq5CiaKHak007"
      },
      Axopar22: {
        any: "https://buy.stripe.com/6oUbJ06R76za8Ouf0Xak006"
      }
    };

    if (boat === "Axopar" && stripeLinks[boat][bookingType]) {
      window.open(stripeLinks[boat][bookingType], "_blank");
    } else if (stripeLinks[boat] && stripeLinks[boat].any) {
      window.open(stripeLinks[boat].any, "_blank");
    }
  };
  const showCaptain = boat === "BlueWater170" || boat === "Axopar22";
  const showTransferFields = bookingType === "Transfer";
  const maxPassengers = boat === "Axopar" ? 8 : boat === "BlueWater170" ? 7 : boat === "Axopar22" ? 5 :"";

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

      {/* Boat Selection */}
      <div>
        <label className="block font-semibold mb-1">Choose a Boat:</label>
        <select value={boat} onChange={(e) => setBoat(e.target.value)} className={inputClass}>
          <option value="">Choose</option>
          <option value="Axopar">Axopar 37XC 11.7 Meter (w/Captain)</option>
          <option value="Axopar22">Axopar 22 T-Top</option>
          <option value="BlueWater170">Blue Axis 5 Meter Boat Rental</option>
        </select>
      </div>

      {/* Booking Type */}
      <div>
        <label className="block font-semibold mb-1">Booking Type:</label>
        <select value={bookingType} onChange={(e) => setBookingType(e.target.value)} className={inputClass}>
          <option value="">Select</option>
          <option value="Full Day Charter">Full Day Charter</option>
          <option value="Half Day Charter">Half Day Charter</option>
          <option value="Transfer">Transfer</option>
        </select>
      </div>

      {/* Departure (Axopar only) */}
      {boat === "Axopar" && (
        <div>
          <label className="block font-semibold mb-1">Departure Point:</label>
          <select value={departure} onChange={(e) => setDeparture(e.target.value)} className={inputClass}>
            <option value="">Select departure point</option>
            <option value="Loutraki, Skopelos">Loutraki, Skopelos</option>
            <option value="Skopelos Town">Skopelos Town</option>
            <option value="Skiathos">Skiathos</option>
            <option value="Varkisa, Athens">Varkisa, Athens</option>
            <option value="Other">Other</option>
          </select>
        </div>
      )}

      {/* Captain Option (only BlueWater and Axopar22) */}
      {showCaptain && (
        <div>
          <label className="block font-semibold mb-1">Captain:</label>
          <select value={captain} onChange={(e) => setCaptain(e.target.value)} className={inputClass}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      )}

      {/* Transfer fields */}
      {showTransferFields && (
        <div className="grid sm:grid-cols-2 gap-4">
          <input placeholder="Transfer From" value={info.transferFrom} onChange={(e) => setInfo({ ...info, transferFrom: e.target.value })} className={inputClass} />
          <input placeholder="Transfer To" value={info.transferTo} onChange={(e) => setInfo({ ...info, transferTo: e.target.value })} className={inputClass} />
        </div>
      )}

      {/* Date + Time */}
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

      {/* Passengers */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Passengers:</label>
          <select value={passengers} onChange={(e) => setPassengers(e.target.value)} className={inputClass}>
            {generatePassengerOptions()}
          </select>
        </div>
      </div>

      {/* Contact Details */}
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
          {boat === "Axopar" && departure && <li><strong>Departure:</strong> {departure}</li>}
          {date && <li><strong>Date:</strong> {date.toLocaleDateString()}</li>}
          {time && <li><strong>Time:</strong> {time}</li>}
          {passengers && <li><strong>Passengers:</strong> {passengers}</li>}
          {showCaptain && <li><strong>Captain:</strong> {captain === "yes" ? "Yes" : "No"}</li>}
          {bookingType === "Transfer" && (
            <li><strong>Transfer:</strong> From {info.transferFrom} to {info.transferTo}</li>
          )}
          <li><strong>Payment:</strong> {getPriceSummary()}</li>
        </ul>
      </div>
      {/* Terms & Conditions */}
<div className="border-t pt-4">
  <label className="block font-semibold mb-2">Terms & Conditions</label>
  <div className="border h-40 overflow-y-scroll p-2 text-sm bg-gray-50 whitespace-pre-wrap">
    By booking, you agree to the following terms:

    - You have read the full Terms & Conditions PDF available below.
    - Cancellations must be made at least 48 hours in advance to receive a refund of your deposit.
      No refund will be issued for cancellations made within 48 hours, unless cancellation is due to weather conditions.
    - You are responsible for any damage caused during your rental.
      A €500 damage hold will apply upon discovery of damage. Additional costs beyond €500 will be charged.
    - All charters are subject to safe weather and sea conditions.
    - Axis Global Inc. is not liable for accidents, injuries, or loss of life during the rental or transfer.
    - Greek jurisdiction applies. Address: Elpidos 17, Varkiza, Greece 16672.
  </div>
  <div className="flex items-center mt-2 space-x-2">
    <input
      type="checkbox"
      id="agree"
      checked={info.agreed || false}
      onChange={(e) => {
        setInfo({ ...info, agreed: e.target.checked, agreementTimestamp: new Date().toISOString() });
      }}
    />
    <label htmlFor="agree" className="text-sm">
      I have read and agree to the Terms & Conditions.
    </label>
  </div>
  <div className="text-sm text-blue-600 mt-1">
    <a href="/Axis_Global_Charter_Terms_Full_Revised.pdf" target="_blank" rel="noopener noreferrer" className="underline">
      Download Full Terms PDF
    </a>
  </div>
</div>

{/* Submit Button */}
<button
  onClick={handleSubmit}
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Submit Booking
</button>
    </div>
  );
}
