const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`\n📥 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Helper to read JSON safely
function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

app.get("/api/dashboard", (req, res) => {
    const finalDeck = readJSON(path.join(__dirname, "outputs", "finalDeck.json"));
    const projects  = readJSON(path.join(__dirname, "inputs", "projects.json"));
    const metrics   = readJSON(path.join(__dirname, "inputs", "metrics.json"));
    const strategy  = readJSON(path.join(__dirname, "inputs", "strategy.json"));

    if (!finalDeck && !projects && !metrics && !strategy) {
        return res.status(404).json({ error: "No data files found" });
    }

    // Extract channel usage & uptime from finalDeck slides content
    const channelPerformance = [];
    const strategySlide = finalDeck?.slides?.find(s => s.slide === "Strategy Overview");
    if (strategySlide && Array.isArray(strategySlide.content)) {
        for (const line of strategySlide.content) {
            if (typeof line === "string") {
                const match = line.match(/^(\w[\w\s]+?) usage at (\d+)% with uptime ([\d.]+)%$/);
                if (match) {
                    channelPerformance.push({
                        channel: match[1],
                        usage: parseFloat(match[2]),
                        uptime: parseFloat(match[3]),
                    });
                }
            }
        }
    }

    // Compute derived portfolio KPIs
    const allProjects = projects?.projects_2025 || finalDeck?.portfolio?.projects || [];
    const totalBudget = allProjects.reduce((s, p) => s + (p.budget || 0), 0);
    const totalActual = allProjects.reduce((s, p) => s + (p.actual_cost || p.cost || 0), 0);
    const completedCount = allProjects.filter(p => p.status === "Completed" || p.progress === 100).length;
    const delayedCount = allProjects.filter(p => p.status === "Delayed").length;

    const dashboard = {
        strategy: finalDeck?.strategy || null,
        bankStrategy: strategy || null,

        meetingAgenda: {
            title: "Board Committee — Digital Channels Review",
            date: new Date().toISOString().split("T")[0],
            items: [
                { time: "09:00", topic: "Opening & Strategic Context", presenter: "Chairperson", duration: "10 min" },
                { time: "09:10", topic: "2025 Portfolio Performance Review", presenter: "PMO Lead", duration: "20 min" },
                { time: "09:30", topic: "Business Metrics & Channel Performance", presenter: "Analytics Head", duration: "15 min" },
                { time: "09:45", topic: "2026 Roadmap & Investment Priorities", presenter: "CTO", duration: "20 min" },
                { time: "10:05", topic: "Risk & Mitigation Updates", presenter: "Risk Officer", duration: "10 min" },
                { time: "10:15", topic: "Discussion & Decisions", presenter: "All", duration: "15 min" },
            ],
        },

        portfolio: allProjects,

        // Derived portfolio-level KPIs
        portfolioKPIs: {
            totalBudget,
            totalActual,
            budgetUtilization: totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0,
            projectCount: allProjects.length,
            completedCount,
            delayedCount,
            inProgressCount: allProjects.length - completedCount - delayedCount,
        },

        // Transaction metrics from metrics.json
        metrics: metrics?.channels || [],

        // Channel usage & uptime from finalDeck slides
        channelPerformance,

        roadmap: projects?.roadmap_2026 || [],

        slides: finalDeck?.slides || [],
        review: finalDeck?.review || [],
    };

    console.log("✅ Dashboard payload assembled");
    res.json(dashboard);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log("─────────────────────────────────");
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/dashboard`);
    console.log("─────────────────────────────────");
});