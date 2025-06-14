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
    transferTo: ""
  });

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
      let month = date ? new Date(date).getMonth() : null;
      let basePrice = 110;
      if (month === 6) basePrice = 120;
      else if (month === 7) basePrice = 130;
      if (captain === "yes") basePrice += 100;
      return `€${basePrice} (€40 Fixed Deposit)`;
    }
    return "";
  };

  const handleSubmit = () => {
    alert("Booking submitted. Stripe will open in a new tab.");
    if (boat === "Axopar") {
      if (bookingType === "Full Day Charter") window.open("https://buy.stripe.com/cNi3cu3EVf5G1m2aKHak003", "_blank");
      else if (bookingType === "Half Day Charter") window.open("https://buy.stripe.com/eVq4gygrH4r25Cig51ak004", "_blank");
    } else if (boat === "5m") {
      window.open("https://buy.stripe.com/6oU9AS0sJcXy3ua9GDak005", "_blank");
    }
  };

  const inputClass = "p-2 border rounded w-full";

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">Axis Yacht Charters</h1>
      <p className="mb-4 text-lg italic">Free to Explore</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class
