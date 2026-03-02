import fetch from "node-fetch";

// Use your fastnet_token cookie value from the browser
const sessionCookie = "fastnet_token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6ImpveW91c0BjbGllbnRzLmZhc3RuZXQuc3lzdGVtcyIsIm5hbWUiOiJqb3lvdXMgQWRtaW4iLCJyb2xlIjoiY2xpZW50X2FkbWluIiwiY2xpZW50SWQiOjExLCJpYXQiOjE3NzI0Njg2OTMsImV4cCI6MTc3MjQ5NzQ5M30.cyFldf_SHJ97AJX_y4i-KeaUNRMAnqp0mHQtUEAyRS8";

const plans = [
  { name: "1 DAY", durationSeconds: 24 * 60 * 60, price: 1000 },
  { name: "3 DAYS", durationSeconds: 3 * 24 * 60 * 60, price: 2500 },
  { name: "WEEKLY", durationSeconds: 7 * 24 * 60 * 60, price: 6000 },
  { name: "MONTHLY", durationSeconds: 30 * 24 * 60 * 60, price: 25000 },
];

async function addPlans() {
  // Fetch existing plans first
  const existing = await fetch("http://localhost:3000/api/client/plans", {
    headers: { "Cookie": sessionCookie },
  });
  const existingPlans: any[] = existing.ok ? await existing.json() : [];
  const existingNames = new Set(existingPlans.map((p: any) => p.name));

  for (const plan of plans) {
    if (existingNames.has(plan.name)) {
      console.log(`Skipped (already exists): ${plan.name}`);
      continue;
    }
    const res = await fetch("http://localhost:3000/api/client/plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": sessionCookie,
      },
      body: JSON.stringify({
        name: plan.name,
        durationSeconds: plan.durationSeconds,
        price: plan.price,
        speedLimit: null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`Added plan: ${plan.name}`);
    } else {
      console.error(`Failed to add plan: ${plan.name}`, data);
    }
  }
}

addPlans();
