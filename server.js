const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const flowableClient = axios.create({
    baseURL: 'http://localhost:9091/flowable-rest/service/',
    auth: { username: 'rest-admin', password: 'test' },
    headers: { 'Content-Type': 'application/json' }
});

app.use((req, res, next) => {
    console.log(`\n📥 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get("/api/dashboard", async (req, res) => {
    console.log("🔍 [STEP 1] Request received");
    try {
        console.log("🔍 [STEP 2] Calling Flowable...");
        const response = await flowableClient.get(
            'history/historic-process-instances?includeProcessVariables=true'
        );
        console.log("🔍 [STEP 3] Got response from Flowable");
        const tickets = response.data.data.map(instance => {
            const vars = {};
            instance.variables.forEach(v => vars[v.name] = v.value);
            return {
                instanceId: instance.id,
                ticketId: vars.ticketId,
                priority: vars.priority,
                description: vars.description,
                state: instance.state,
                startTime: instance.startTime
            };
        });
        console.log(`🔍 [STEP 4] Returning ${tickets.length} tickets`);
        res.json({ total: tickets.length, tickets });
        console.log("✅ [DONE] Response sent");
    } catch (err) {
        console.error("💥 [ERROR]", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log("─────────────────────────────────");
    console.log("🚀 Server: http://localhost:3000");
    console.log("📡 API: http://localhost:3000/api/dashboard");
    console.log("─────────────────────────────────");
});
