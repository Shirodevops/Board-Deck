function run(insights, portfolio) {
    const slides = [];

    // existing performance slides
    insights.forEach(i => {
        slides.push({
            title: `${i.channel} Performance`,
            bullets: [
                `Volume: ${i.volume}`,
                `Success Rate: ${i.success_rate.toFixed(2)}`,
                i.insight
            ],
            implication: "Optimize channel usage"
        });
    });

    // 2025 Delivery Overview
    slides.push({
        title: "2025 Project Delivery (Status & Schedule)",
        bullets: portfolio.projects_2025.map(p =>
            `${p.name}: ${p.status} | ${p.start_date} → ${p.end_date} | ${p.progress}% | ${p.rag}`
        ),
        implication: "Visibility on execution timelines and delivery health"
    });

    // Cost vs Budget
    slides.push({
        title: "2025 Financial Performance (Cost vs Budget)",
        bullets: portfolio.projects_2025.map(p =>
            `${p.name}: Budget ${p.budget} vs Actual ${p.actual_cost} (${p.cost_variance_pct}% variance)`
        ),
        implication: "Control of IT investment and cost discipline"
    });

    // Combined Risk View
    slides.push({
        title: "Execution Risk Overview",
        bullets: portfolio.projects_2025.map(p =>
            `${p.name}: ${p.rag} | Cost variance ${p.cost_variance_pct}%`
        ),
        implication: "Focus on high-risk projects impacting delivery and cost"
    });

    // 2026 Roadmap
    slides.push({
        title: "2026 Roadmap",
        bullets: portfolio.roadmap_2026.map(p =>
            `${p.name} (${p.priority}) → ${p.expected_impact}`
        ),
        implication: "Next phase of transformation aligned to strategy"
    });

    return slides;
}

module.exports = { run };