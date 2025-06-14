import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BookingApp() {
  const [boat, setBoat] = useState("");
  const [bookingType, setBookingType] = useState("");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [captain, setCaptain] = useState("no");
  const [info, setInfo] = useState({ transferFrom: "", transferTo: "" });

  const boatNames = {
    Axopar: "Axopar 37XC 11.7 Meter (w/Captain)",
    "5m": "5 Meter 30HP (50HP) Boat Rental"
  };

  const getPriceSummary = () => {
    if (!boat) return "";
    if (bookingType === "Transfer") return "Contact for further info";
    if (boat === "Axopar") {
      if (bookingType === "Full Day Charter") return "€1,450 (30% = €435)";
      if (bookingType === "Half Day Charter") return "€1,100 (30% = €330)";
    }
    if (boat === "5m") {
      let basePrice = 110;
      if (captain === "yes") basePrice += 100;
      return `€${basePrice} (€40 Fixed Deposit)`;
    }
    return "";
  };

  const showCaptain = boat === "5m";
  const showTransferFields = bookingType === "Transfer";

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-2">Axis Yacht Charters</h1>
      <p className="mb-4 text-lg italic">Free to Explore</p>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Choose a Boat:</label>
        <select
          value={boat}
          onChange={(e) => setBoat(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Choose</option>
          <option value="Axopar">Axopar 37XC 11.7 Meter (w/Captain)</option>
          <option value="5m">5 Meter 30HP (50HP) Boat Rental</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Booking Type:</label>
        <select
          value={bookingType}
          onChange={(e) => setBookingType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select</option>
          <option value="Full Day Charter">Full Day Charter</option>
          <option value="Half Day Charter">Half Day Charter</option>
          <option value="Transfer">Transfer</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Date:</label>
        <DatePicker
          selected={date}
          onChange={(d) => setDate(d)}
          placeholderText="Select Date"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Time:</label>
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Time</option>
          <option value="08:00">08:00</option>
          <option value="08:30">08:30</option>
          <option value="09:00">09:00</option>
          <option value="09:30">09:30</option>
          <option value="10:00">10:00</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Passengers:</label>
        <select
          value={passengers}
          onChange={(e) => setPassengers(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {[...Array(8)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i
