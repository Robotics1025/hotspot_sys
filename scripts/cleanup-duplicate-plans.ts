import fetch from "node-fetch";

// Use your fastnet_token cookie value from the browser
const sessionCookie = "fastnet_token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6ImpveW91c0BjbGllbnRzLmZhc3RuZXQuc3lzdGVtcyIsIm5hbWUiOiJqb3lvdXMgQWRtaW4iLCJyb2xlIjoiY2xpZW50X2FkbWluIiwiY2xpZW50SWQiOjExLCJpYXQiOjE3NzI0Njg2OTMsImV4cCI6MTc3MjQ5NzQ5M30.cyFldf_SHJ97AJX_y4i-KeaUNRMAnqp0mHQtUEAyRS8";

async function cleanupDuplicates() {
    const res = await fetch("http://localhost:3000/api/client/plans", {
        headers: { "Cookie": sessionCookie },
    });

    if (!res.ok) {
        console.error("Failed to fetch plans");
        process.exit(1);
    }

    const plans: any[] = await res.json();
    console.log(`Found ${plans.length} total plans`);

    // Group by name, keep the one with the lowest id, delete the rest
    const seen = new Map<string, number>(); // name -> lowest id to keep
    const toDelete: number[] = [];

    for (const plan of plans.sort((a, b) => a.id - b.id)) {
        if (seen.has(plan.name)) {
            toDelete.push(plan.id);
        } else {
            seen.set(plan.name, plan.id);
        }
    }

    if (toDelete.length === 0) {
        console.log("No duplicates found.");
        return;
    }

    console.log(`Deleting ${toDelete.length} duplicate(s): IDs [${toDelete.join(", ")}]`);

    for (const id of toDelete) {
        const del = await fetch(`http://localhost:3000/api/client/plans?id=${id}`, {
            method: "DELETE",
            headers: { "Cookie": sessionCookie },
        });
        if (del.ok) {
            console.log(`Deleted plan ID ${id}`);
        } else {
            console.error(`Failed to delete plan ID ${id}`);
        }
    }

    console.log("Cleanup complete.");
}

cleanupDuplicates();
