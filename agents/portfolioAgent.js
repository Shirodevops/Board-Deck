const fs = require('fs');

function daysBetween(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
}

function run() {
    const data = JSON.parse(
        fs.readFileSync('./inputs/projects.json')
    );

    const projects = data.projects_2025.map(p => {
        const duration = daysBetween(p.start_date, p.end_date);

        const costVariance = p.actual_cost - p.budget;
        const costVariancePct = (costVariance / p.budget) * 100;

        let rag = "Green";
        if (p.status === "Delayed" || costVariancePct > 15) rag = "Red";
        else if (costVariancePct > 5) rag = "Amber";

        return {
            name: p.name,
            status: p.status,
            progress: p.progress,
            start_date: p.start_date,
            end_date: p.end_date,
            duration_days: duration,
            budget: p.budget,
            actual_cost: p.actual_cost,
            cost_variance: costVariance,
            cost_variance_pct: costVariancePct.toFixed(1),
            rag,
            alignment: p.alignment.join(', ')
        };
    });

    return {
        projects_2025: projects,
        roadmap_2026: data.roadmap_2026
    };
}

module.exports = { run };