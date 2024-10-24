import axios from 'axios';

// Fetch events from the backend
export const getEvents = async (lat, lon) => {
  try {  
    const response = await axios.get(`http://localhost:5001/events/shows?lat=${lat}&lon=${lon}`, {
      withCredentials: true,  // Allows cookies to be sent, required for session management
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};
