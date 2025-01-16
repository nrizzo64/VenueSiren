import React, { useEffect, useState } from 'react';
import { getEvents } from '../api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  return (
    <div className="events">
      <h1>Nearby Shows</h1>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Events;
