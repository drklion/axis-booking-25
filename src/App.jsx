import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";

export default function BookingApp() {
  const [boat, setBoat] = useState("");
  const [bookingType, setBookingType] = useState("");

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">Axis Yacht Charters</h1>
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

      <p><strong>Transfer:</strong> {bookingType === "Transfer" ? `From location A to location B` : "N/A"}</p>
    </div>
  );
}
