# BrainGym_TeamCodeRed

# Brain Gym

Brain Gym is a full-stack web app for daily brain-training workouts.  
It includes a landing page, signup/login flow, game sequence, progress tracking, goal setting, and workout map with MongoDB-backed user data.

## Tech Stack
- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js, Express
- Database: MongoDB

## Features
- Landing page with game overview
- User signup and login
- Daily workout game flow
- Progress tracking with score graph
- Goal setting (week/month/year)
- Workout map (calendar heatmap)
- User profile/settings pages

## Prerequisites
- Node.js 18+ installed
- MongoDB running locally (or a reachable MongoDB URI)

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the project root (or copy `.env.example`):
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=brain_gym
```

3. Start the server:
```bash
npm start
```

## How To Access The Website
1. Make sure MongoDB is running.
2. Run `npm start`.
3. Open your browser and go to:
- `http://localhost:3000` (landing page)
4. Use:
- `Login` if you already have an account
- `Sign Up` to create a new account
5. After login/signup, you will be redirected to:
- `http://localhost:3000/home.html`

## Useful Pages
- Landing: `/`
- Login: `/login.html`
- Signup: `/signup.html`
- Home: `/home.html`
- Track Progress: `/track-progress.html`
- Set Goals: `/set-goals.html`
- Workout Map: `/workout-map.html`

## API Health Check
- `GET /api/health` should return:
```json
{ "ok": true }
```

## Deployment (Render)
This project is configured for Render using `render.yaml`.

1. Push this project to GitHub.
2. In Render, click **New +** -> **Blueprint**.
3. Connect your GitHub repo.
4. Render will detect `render.yaml` and create the web service.
5. Set environment variable:
   - `MONGODB_URI` = your MongoDB Atlas connection string
6. Deploy.

After deploy, open:
- `https://<your-render-service>.onrender.com`

### Important Before Deploy
- Keep extracted game folders in `games/**/dist` (required).
- Zip files are not needed in production. Remove them from the repo if possible to reduce deploy size.


Screenshots:

Home Page:
<img width="2471" height="1395" alt="Screenshot 2026-02-19 183313" src="https://github.com/user-attachments/assets/ccb73c3c-d6a7-4b84-baf9-0c23d5695e0e" />

Track Progress:
<img width="2448" height="1390" alt="Screenshot 2026-02-19 183333" src="https://github.com/user-attachments/assets/118eb61a-e694-4dac-bacd-998b12db4025" />

Stress Busters:
<img width="2474" height="1402" alt="Screenshot 2026-02-19 183359" src="https://github.com/user-attachments/assets/fbd4565c-7bb6-4533-8f55-a9863459ea9a" />


Demo Video:
https://amritavishwavidyapeetham-my.sharepoint.com/:v:/g/personal/cb_sc_u4cse24155_cb_students_amrita_edu/IQBtZsATJ5eMT65qWvPewQSNAcjCcrZ5ZCfuexreCaxwpfE?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=y3C58v
