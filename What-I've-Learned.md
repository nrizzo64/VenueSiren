# What I've Learned While Working On This Project

## Security
1. Encryption vs Hashing
    - Encryption is 2 way (reversible)
        - Good for sensitive info that you also need to have in plaintext at some point
            - Access/Refresh tokens
    - Hashing is 1 way (non-reversible)
        - Good for sensitive info that you only need to verify for correctness
            - Session ID (I don't care what the Session ID actually is; I just want to verify that the Session ID my server is receiving from the client matches the one on the server for that user.

## Database Schema
1. Linking/Junction Tables
    - Re-learned about linking/junction tables that connect Many to Many relationships 
