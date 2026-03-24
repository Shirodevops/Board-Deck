const fs = require("fs");
const path = require("path");

// -------------------- Mocked Agents --------------------
const strategy = {
    run: () => ({
        name: "Digital Channels Optimization",
        goals: ["Mobile-first adoption", "Branch efficiency", "Customer experience"],
        status: "On track"
    })
};

const data = {
    run: async () => ({
        metrics: [
            { channel: "ATM", usage: 75, uptime: 99.2 },
            { channel: "Kiosk", usage: 45, uptime: 98.0 },
            { channel: "Branch", usage: 60, uptime: 97.5 },
            { channel: "Mobile App", usage: 85, uptime: 99.8 }
        ]
    })
};

const analysis = {
    run: (metrics) => ({
        insights: metrics.metrics.map(m => `${m.channel} usage at ${m.usage}% with uptime ${m.uptime}%`)
    })
};

const portfolio = {
    run: () => ({
        projects: [
            { name: "ATM Upgrade", status: "On track", start: "2025-01-01", end: "2025-06-30", cost: 50000, budget: 55000 },
            { name: "Mobile App Revamp", status: "Delayed", start: "2025-02-15", end: "2025-08-30", cost: 120000, budget: 100000 },
            { name: "Kiosk Expansion", status: "On track", start: "2025-03-01", end: "2025-09-15", cost: 30000, budget: 30000 }
        ]
    })
};

const content = {
    run: (insights, portfolioData) => [
        { slide: "Strategy Overview", content: insights.insights },
        { slide: "Portfolio Summary", content: portfolioData.projects }
    ]
};

const viz = {
    run: (slides) => slides.map(slide => ({ ...slide, visual: `Chart for ${slide.slide}` }))
};

const qa = {
    run: (slides) => slides.map(slide => ({ slide: slide.slide, review: "QA passed" }))
};

// -------------------- Pipeline Execution --------------------
async function runPipeline() {
    console.log("🚀 Pipeline started");

    try {
        console.log("1️⃣ Strategy agent...");
        const strat = strategy.run();
        console.log("✅ Strategy:", strat);

        console.log("2️⃣ Data agent...");
        const metrics = await data.run();
        console.log("✅ Metrics:", metrics);

        console.log("3️⃣ Analysis agent...");
        const insights = analysis.run(metrics);
        console.log("✅ Insights:", insights);

        console.log("4️⃣ Portfolio agent...");
        const portfolioData = portfolio.run();
        console.log("✅ Portfolio:", portfolioData);

        console.log("5️⃣ Generating slides...");
        const slides = content.run(insights, portfolioData);
        console.log("✅ Slides:", slides);

        console.log("6️⃣ Generating visuals...");
        const visuals = viz.run(slides);
        console.log("✅ Visuals:", visuals);

        console.log("7️⃣ QA review...");
        const review = qa.run(slides);
        console.log("✅ QA:", review);

        const output = { strategy: strat, portfolio: portfolioData, slides, visuals, review };

        // Write to outputs/finalDeck.json
        const outputDir = path.join(__dirname, "../outputs");
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const outputFile = path.join(outputDir, "finalDeck.json");
        fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

        console.log("✅ Board deck generated at:", outputFile);

    } catch (error) {
        console.error("❌ Pipeline failed:", error);
    }
}

runPipeline();