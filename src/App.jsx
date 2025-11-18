 import { useState } from "react";
import DatePicker from "react-datepicker";

const initialInventory = { BlueWater170: [], Axopar22: [] };

export default function App() {
  const today = new Date();

  // ---------------- State ----------------
  const [boat, setBoat] = useState("");
  const [bookingType, setBookingType] = useState("");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [captain, setCaptain] = useState("no");
  const [departure, setDeparture] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [info, setInfo] = useState({
    name: "", phone: "", email: "",
    country: "", address: "", city: "", state: "", zip: "",
    transferFrom: "", transferTo: "",
    agreed: false, agreementTimestamp: ""
  });
  const [inventory, setInventory] = useState(initialInventory);

  // --------------- Config ----------------
  const boatNames = {
    Axopar: "Axopar 37XC 11.7 Meter (w/Captain)",
    Axopar22: "Axopar 22 T-Top",
    BlueWater170: "Blue Water 170 5 Meter Rental"
  };
  const showCaptain = boat === "BlueWater170" || boat === "Axopar22";
  const showTransferFields = bookingType === "Transfer";
  const maxPassengers = boat === "Axopar" ? 8 : boat === "BlueWater170" ? 7 : boat === "Axopar22" ? 5 : 8;
  const inputClass = "axis-input";

  // --------------- Helpers ----------------
  const isTimeSlotAvailable = (boatName, newStart, duration) => {
    const bookings = inventory[boatName] || [];
    const newEnd = newStart + duration * 60;
    return bookings.every(([start, end]) => newEnd <= start || newStart >= end);
  };

  const handleBooking = () => {
    if (boat === "BlueWater170" || boat === "Axopar22") {
      if (!time) { alert("Please select a time."); return null; }
      const duration = bookingType === "Full Day Charter" ? 8 : 4;
      const [hour, min] = time.split(":").map(Number);
      const start = hour * 60 + min;
      const boatKey = boat;
      if (!isTimeSlotAvailable(boatKey, start, duration)) {
        alert("No available boats at that time."); return null;
      }
      const newEnd = start + duration * 60;
      setInventory(prev => ({ ...prev, [boatKey]: [...prev[boatKey], [start, newEnd]] }));
      return boatKey;
    }
    return "OK";
  };

  const getPriceSummary = () => {
    if (!boat) return "";
    if (bookingType === "Transfer") return "Contact for further info";
    const month = date ? new Date(date).getMonth() : null;
    if (month === null) return "Select a date";

    if (boat === "Axopar22") {
      const full = [200,200,200,225,250,250,250,250,200,0,0,0];
      const half = [150,150,150,175,200,200,200,200,150,0,0,0];
      const base = bookingType === "Full Day Charter" ? full[month] : half[month];
      if (base === 0) return "Unavailable this month";
      return `€${captain === "yes" ? base + 100 : base} (€100 Fixed Deposit)`;
    }
    if (boat === "BlueWater170") {
      const full = [80,80,80,80,90,100,110,110,90,80,0,0];
      const half = [70,70,70,70,80,90,90,90,80,70,0,0];
      const base = bookingType === "Full Day Charter" ? full[month] : half[month];
      if (base === 0) return "Unavailable this month";
      return `€${captain === "yes" ? base + 100 : base} (€50 Fixed Deposit)`;
    }
    if (boat === "Axopar") {
      return bookingType === "Full Day Charter" ? "€1,200 (50% deposit = €600)" : "€1,100 (50% deposit = €550)";
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
Agreed Terms: ${info.agreed ? `Yes at ${info.agreementTimestamp}` : "No"}
Address: ${[info.country, info.address, info.city, info.state, info.zip].filter(Boolean).join(" ")}`;

    fetch("https://formsubmit.co/ajax/info@axisyachtcharters.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name: info.name, email: info.email, message: summary })
    })
      .then(r => r.json())
      .then(d => console.log("Email sent:", d))
      .catch(err => console.error("Error sending email:", err));
  };

  // Inline options
  const timeOptions = (() => {
    const arr = [];
    for (let h = 8; h <= 12; h++) {
      arr.push(`${String(h).padStart(2, "0")}:00`);
      if (h < 12) arr.push(`${String(h).padStart(2, "0")}:30`);
    }
    return arr;
  })();
  const passengerOptions = Array.from({ length: maxPassengers || 8 }, (_, i) => i + 1);

  // Submit
 const handleSubmit = (e) => {
  e?.preventDefault?.();
  setTriedSubmit(true);

  const trim = (s) => (s || "").toString().trim();

  const name  = trim(info.name);
  const phone = trim(info.phone);
  const email = trim(info.email);
  const tFrom = trim(info.transferFrom);
  const tTo   = trim(info.transferTo);

  // Debug – proves the handler is actually firing on iPhone
  console.log("SUBMIT PRESSED");

  // 1) BASIC CHOICES
  if (!boat) {
    alert("Please choose a boat.");
    return;
  }

  if (!bookingType) {
    alert("Please choose a booking type.");
    return;
  }

  if (!date) {
    alert("Please select a date.");
    return;
  }

  if (!time) {
    alert("Please select a time.");
    return;
  }

  if (boat === "Axopar" && !trim(departure)) {
    alert("Please select a departure point for the Axopar 37XC.");
    return;
  }

  // 2) CONTACT INFO – these SHOULD block you if empty
  if (!name) {
    alert("Please enter your full name.");
    return;
  }

  if (!phone) {
    alert("Please enter your phone number.");
    return;
  }

  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  // 3) TERMS – this check comes AFTER the name/phone/email checks
  if (!info.agreed) {
    alert("You must agree to the Terms & Conditions before submitting.");
    return;
  }

  // 4) TRANSFER FIELDS
  if (bookingType === "Transfer") {
    if (!tFrom) {
      alert("Please enter the Transfer From location.");
      return;
    }
    if (!tTo) {
      alert("Please enter the Transfer To location.");
      return;
    }
  }

  // 5) PASSENGERS LIMIT
  if (parseInt(passengers, 10) > parseInt(maxPassengers || 8, 10)) {
    alert(`Maximum passengers for this boat is ${maxPassengers}.`);
    return;
  }

  // 6) AVAILABILITY FOR RENTALS
  if (
    bookingType !== "Transfer" &&
    (boat === "BlueWater170" || boat === "Axopar22")
  ) {
    const assignedBoat = handleBooking();
    if (!assignedBoat) return; // clash => handleBooking already alerted
  }

  // 7) EMAIL + STRIPE
  sendEmail();
  alert("Booking submitted. Stripe will open in a new tab.");

  const stripeLinks = {
    Axopar: {
      "Full Day Charter": "https://buy.stripe.com/bJecN44IZ6zac0G2ebak008",
      "Half Day Charter": "https://buy.stripe.com/28EcN4grHcXyc0G8Czak009"
    },
    BlueWater170: { any: "https://buy.stripe.com/3cI8wO5N3aPq5CiaKHak007" },
    Axopar22:     { any: "https://buy.stripe.com/6oUbJ06R76za8Ouf0Xak006" }
  };

  if (boat === "Axopar" && stripeLinks[boat][bookingType]) {
    window.open(stripeLinks[boat][bookingType], "_blank");
  } else if (stripeLinks[boat]?.any) {
    window.open(stripeLinks[boat].any, "_blank");
  }
};
  // --------------- JSX ----------------
  return (
    <div className="axis-form">
      <h1 className="axis-title">Axis Yacht Charters</h1>
      <p className="axis-sub">Free to Explore</p>

      <div>
        <label className="axis-label">Choose a Boat:</label>
        <select value={boat} onChange={(e) => setBoat(e.target.value)} className={inputClass}>
          <option value="">Choose</option>
          <option value="Axopar">Axopar 37XC 11.7 Meter (w/Captain)</option>
          <option value="Axopar22">Axopar 22 T-Top</option>
          <option value="BlueWater170">Blue Axis 5 Meter Boat Rental</option>
        </select>
      </div>

      <div>
        <label className="axis-label">Booking Type:</label>
        <select value={bookingType} onChange={(e) => setBookingType(e.target.value)} className={inputClass}>
          <option value="">Select</option>
          <option value="Full Day Charter">Full Day Charter</option>
          <option value="Half Day Charter">Half Day Charter</option>
          <option value="Transfer">Transfer</option>
        </select>
      </div>

      {boat === "Axopar" && (
        <div>
          <label className="axis-label">Departure Point:</label>
          <select value={departure} onChange={(e) => setDeparture(e.target.value)} className={inputClass}>
            <option value="" disabled>Select departure point</option>
            <option value="Loutraki, Skopelos">Loutraki, Skopelos</option>
            <option value="Skopelos Town">Skopelos Town</option>
            <option value="Skiathos">Skiathos</option>
            <option value="Varkiza, Athens">Varkiza, Athens</option>
            <option value="Other">Other</option>
          </select>
          {triedSubmit && !departure && <p className="axis-error">Please choose a departure point.</p>}
        </div>
      )}

      {showTransferFields && (
        <div className="axis-grid">
          <input placeholder="Transfer From" value={info.transferFrom} onChange={(e) => setInfo({ ...info, transferFrom: e.target.value })} className={inputClass} />
          <input placeholder="Transfer To" value={info.transferTo} onChange={(e) => setInfo({ ...info, transferTo: e.target.value })} className={inputClass} />
        </div>
      )}

      <div className="axis-grid">
        <div>
          <label className="axis-label">Select Date:</label>
          <DatePicker selected={date} onChange={setDate} minDate={today} className={inputClass} />
        </div>
        <div>
          <label className="axis-label">Select Time:</label>
          <select value={time} onChange={(e) => setTime(e.target.value)} className={inputClass}>
            <option value="">Select Time</option>
            {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="axis-label">Passengers:</label>
        <select value={passengers} onChange={(e) => setPassengers(e.target.value)} className={inputClass}>
          {Array.from({ length: maxPassengers || 8 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <div className="axis-note">Max {maxPassengers} passengers</div>
      </div>

      <div className="axis-grid">
        <input placeholder="Full Name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} className={inputClass} />
        <input placeholder="Phone" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} className={inputClass} />
        <input placeholder="Email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} className={inputClass} />
        <input placeholder="Country" value={info.country} onChange={(e) => setInfo({ ...info, country: e.target.value })} className={inputClass} />
        <input placeholder="Address" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} className={inputClass} />
        <input placeholder="City" value={info.city} onChange={(e) => setInfo({ ...info, city: e.target.value })} className={inputClass} />
        <input placeholder="State" value={info.state} onChange={(e) => setInfo({ ...info, state: e.target.value })} className={inputClass} />
        <input placeholder="ZIP" value={info.zip} onChange={(e) => setInfo({ ...info, zip: e.target.value })} className={inputClass} />
      </div>

      <div className="axis-section">
        <p style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Booking Summary</p>
        <ul>
          {info.name && <li><strong>Name:</strong> {info.name}</li>}
          {info.phone && <li><strong>Phone:</strong> {info.phone}</li>}
          {boat && <li><strong>Boat:</strong> {boatNames[boat]}</li>}
          {bookingType && <li><strong>Booking Type:</strong> {bookingType}</li>}
          {boat === "Axopar" && departure && <li><strong>Departure:</strong> {departure}</li>}
          {date && <li><strong>Date:</strong> {date.toLocaleDateString()}</li>}
          {time && <li><strong>Time:</strong> {time}</li>}
          {passengers && <li><strong>Passengers:</strong> {passengers}</li>}
          {showCaptain && <li><strong>Captain:</strong> {captain === "yes" ? "Yes" : "No"}</li>}
          {bookingType === "Transfer" && <li><strong>Transfer:</strong> From {info.transferFrom} to {info.transferTo}</li>}
          <li><strong>Payment:</strong> {getPriceSummary()}</li>
        </ul>
      </div>

      <div className="axis-section">
        <label className="axis-label">Terms & Conditions</label>
        <div style={{ border: "1px solid #e5e7eb", height: 160, overflowY: "auto", padding: 8, fontSize: 14, background: "#f8fafc", whiteSpace: "pre-wrap" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <input
            type="checkbox"
            id="agree"
            checked={info.agreed || false}
            onChange={(e) => setInfo({ ...info, agreed: e.target.checked, agreementTimestamp: new Date().toISOString() })}
          />
          <label htmlFor="agree" style={{ fontSize: 14 }}>I have read and agree to the Terms & Conditions.</label>
        </div>
        {triedSubmit && !info.agreed && <p className="axis-error">You must agree to the Terms & Conditions before submitting.</p>}
        <div style={{ fontSize: 14, marginTop: 4 }}>
          <a href="/Axis_Global_Inc_Boat_Rental_Agreement.pdf" target="_blank" rel="noopener noreferrer" className="axis-link">
            Download Full Terms PDF
          </a>
        </div>
      </div>

      <button
        type="button"
        className="axis-submit"
        onClick={handleSubmit}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
      >
        Submit Booking
      </button>
    </div>
  );
}
