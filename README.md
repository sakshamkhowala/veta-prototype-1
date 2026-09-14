# Veta Live Arrival

"Veta" — a real-time train arrival prediction dashboard for Indian Railways, built for a Smart India Hackathon prototype demo.

CONCEPT

Instead of a fixed train schedule, Veta shows a live, constantly-updating predicted arrival time (ETA) for each train, based on simulated live conditions (current position, delay so far, weather, and track congestion). The ETA should visibly update every few seconds to demonstrate the "live" concept.

PAGES / SCREENS

1. Live Dashboard (default/home page)

   - A list (or map view) of 3–5 simulated trains, each showing: train name/number, current station or position along the route, current delay in minutes, predicted ETA at the next station, and a status tag (On Time / Delayed / Recovering)

   - ETAs should auto-update every few seconds using simulated data (randomized small changes) to look "live"

   - Include a simple line/area chart showing how one selected train's predicted delay has changed over the last few checkpoints

2. Train Detail Page

   - Click into a train from the dashboard to see its full route as a vertical timeline of stations

   - Each station shows: scheduled arrival, predicted arrival, and difference (+/- minutes)

   - Show a small map or route line indicating current position

3. Passenger View

   - A simplified, mobile-friendly single page: pick a train, see just "Your train arrives at [station] in [X] minutes" in large, clear text

   - Minimal distractions — this is the passenger-facing screen

4. About / How It Works (simple info page)

   - A short, plain-language explanation of how the prediction works: live location + weather + track congestion + past patterns feed into a model that keeps updating the ETA

   - No technical jargon — written for a general audience

DATA

- Use realistic mock/simulated data — no real API needed for the prototype

- 3–5 trains, each with 5–8 stations along its route

- Simulate delay changes randomly within a realistic range (e.g. -5 to +20 minutes) every few seconds to make the dashboard feel live

DESIGN

- Clean, modern, professional look — navy blue (#1F3864) and blue (#1565C0) as primary colors, white background

- Card-based layout for the train list

- Clear status colors: green for on-time, amber/orange for minor delay, red for major delay

- Should look credible enough to demo in front of judges — not playful or cartoonish

NAME / BRANDING

- App name: Veta

- Tagline: "Predict. Plan. Arrive Better."


- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
