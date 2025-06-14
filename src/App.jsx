import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";

const initialInventory = {
  Athena: [],
  Thalia: [],
  Stefani: []
};

export default function BookingApp() {
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
      const [hour, min] = time.split(":").map(Number);
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
    const summary = \`Boat: \${boat ? boatNames[boat] : ""}\nBooking Type: \${bookingType}\nDate: \${date ? date.toLocaleDateString() : ""}\nTime: \${time}\nPassengers: \${passengers}\nCaptain: \${boat === "5m" ? captain : "Included"}\nPayment: \${getPriceSummary()}\nTransfer: \${bookingType === "Transfer" ? \`From \${info.transferFrom} to \${info.transferTo}\` : "N/A"}\nAddress: \${[info.country, info.address, info.city, info.state, info.zip].filter(Boolean).join(" ")}\`;

    fetch("https://formsubmit.co/ajax/info@axisyachtcharters.com", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name: info.name, email: info.email, message: summary })
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

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">Axis Yacht Charters</h1>
      <p className="mb-4 text-lg italic">Free to Explore</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <select className="p-2 border rounded" value={boat} onChange={e => setBoat(e.target.value)}>
          <option value="">Choose a Boat</option>
          <option value="Axopar">Axopar 37XC 11.7 Meter (w/Captain)</option>
          <option value="5m">5 Meter 30HP (50HP) Boat Rental</option>
        </select>
        <select className="p-2 border rounded" value={bookingType} onChange={e => setBookingType(e.target.value)}>
          <option value="">Booking Type</option>
          <option>Full Day Charter</option>
          <option>Half Day Charter</option>
          <option>Transfer</option>
        </select>
      </div>
      <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Book Now</button>
    </div>
  );
}