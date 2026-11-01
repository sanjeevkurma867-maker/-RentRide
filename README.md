# RentRide

RentRide is a full stack vehicle rental app for Hyderabad, built with Express, SQLite, vanilla JavaScript, and Socket.io.

## Run locally

```bash
npm install
npm start
```

Open **http://localhost:3000**. The first start creates `data/rentride.db` and seeds 60 vehicles, 10 demo owners plus the featured owner account, a renter, and a sample booking. Uploaded vehicle images are stored under `uploads/`.

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Renter | renter@demo.com | Demo@123 |
| Owner | owner@demo.com | Demo@123 |

Other seeded owner emails are `kiran@rentride.demo`, `sana@rentride.demo`, `vikram@rentride.demo`, `priya@rentride.demo`, `arjun@rentride.demo`, `isha@rentride.demo`, `dev@rentride.demo`, `ananya@rentride.demo`, `rahul@rentride.demo`, and `zoya@rentride.demo`. Their shared password is `Demo@123`.

Set `JWT_SECRET` and `COOKIE_SECURE=true` in a production environment. `COOKIE_SECURE` must remain `false` for local HTTP development.

## Features

- Search, category, hourly price and nearest location filtering
- Vehicle detail pages with OpenStreetMap maps, booking estimates, owner details and chat
- Renter bookings with cancellation of pending requests
- Owner dashboard for inventory, photo uploads, availability, booking decisions and inbox
- One login can use both the renter dashboard and owner workspace; choose “Enable owner workspace” from “List your vehicle”, then switch dashboards from the sidebar
- HTTP-only JWT cookie authentication with renter and owner roles
- Persisted chat messages and automatic replies for renter conversations
