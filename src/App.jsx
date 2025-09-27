import React, { useState } from 'react';

export default function App() {
  const [n] = useState(1);
  return <div style={{ padding: 20 }}>Hello Axis Booking {n}</div>;
}
