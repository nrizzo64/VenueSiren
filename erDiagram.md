![Venue Siren-2025-01-03-205413](https://github.com/user-attachments/assets/8462e6dc-73da-44f4-a605-7b5a27b0e454)


---
config:
  theme: neo-dark
---
%% Field types use generic type when appropriate: E.g. `string`

%% Fields marked with `E` in the last column are encrypted

%% Fields marked with `H` in the last column are hashed

erDiagram
    spotify_users ||--|| spotify_tokens : has
    spotify_users ||--|| sessions : has
    spotify_users }|--|| spotify_user_artists : has
    spotify_artists }|--|| spotify_user_artists : has

    spotify_users {
        string user_id PK
        string spotify_user_id "E"
        timestamp created_at
    }

    spotify_tokens {
        string user_id PK "FK"
        string access_token "E"
        timestamp access_token_expiration
        string refresh_token "E"
    }

    sessions {
        string session_id PK
        string user_id FK
        string ip_address "H"
        timestamp created_at
        timestamp expires_at
    }
    spotify_artists {
        string spotify_artist_id PK
        string name
        string spotify_uri
        timestamp last_synced
    }
    spotify_user_artists {
        string user_id FK
        string spotify_artist_id FK
    }
