import React, { useEffect, useState } from 'react';
import { getEvents } from '../api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;

          // Fetch events based on location
          getEvents(latitude, longitude)
            .then(data => {
              setEvents(data);
            })
            .catch(err => {
              setError('Error fetching events');
            });
        },
        () => {
          setError('Unable to retrieve your location');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  }, []);

  return (
    <div className="events">
      <h1>Nearby Shows</h1>
      {error && <p>{error}</p>}
      <ul>
        {events.map(event => (
          <li key={event.id}>
            <h2>{event.name}</h2>
            <p>{event.dates.start.localDate} - {event._embedded.venues[0].name}</p>
            <a href={event.url} target="_blank" rel="noopener noreferrer">Get Tickets</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Events;
