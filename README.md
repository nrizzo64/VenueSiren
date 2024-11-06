# Venue Siren 🎸

**Venue Siren** is a full-stack application that helps music fans stay updated on concerts happening near them. Users can track their favorite artists and receive notifications when they’re playing nearby, with seamless Spotify integration for user login and artist tracking.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## Features

- **Concert Tracking**: Keeps users up to date with concerts in their area based on tracked artists.
- **Spotify Integration**: Uses Spotify’s OAuth 2.0 for secure user authentication, allowing users to log in with their Spotify accounts and automatically track followed artists.
- **Stateful Architecture**: Maintains user sessions via session IDs, enabling a consistent experience across requests.
- **Scalable Backend**: Node.js and Express-based backend with PostgreSQL to handle user data and concert information.
- **Efficient Data Fetching**: Integrates with the Ticketmaster API to fetch and display nearby concert data efficiently.

---

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: Spotify OAuth 2.0
- **APIs**: Ticketmaster API for event data

---

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/venue-siren.git
    cd venue-siren
    ```

2. **Install dependencies**:
    ```bash
    npm install          # Installs backend dependencies
    cd client && npm install   # Installs frontend dependencies
    ```

3. **Set up environment variables**:

   Create a `.env` file in the root directory with the following variables:

    ```plaintext
    SPOTIFY_CLIENT_ID=your_spotify_client_id
    SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
    REDIRECT_URI=your_redirect_uri
    SESSION_SECRET=your_session_secret
    TICKETMASTER_API_KEY=your_ticketmaster_api_key
    ```

4. **Run the application**:
    ```bash
    npm run dev   # Starts both client and server
    ```

---

## Usage

1. **Log in with Spotify** to authenticate and load your followed artists.
2. **Track concerts** happening nearby for the artists you follow.
3. **Receive notifications** when tracked art
