import React, { useEffect, useState } from "react";
//import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
<div className="p-4 border rounded-xl shadow">
  Content here
</div>

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/outputs/finalDeck.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return <div className="p-4">Loading...</div>;

  const chartData = data.slides
    .filter((s) => s.title.includes("Performance"))
    .map((s) => ({
      name: s.title.split(" ")[0],
      value: parseFloat(s.bullets[1].split(": ")[1])
    }));

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Channel Success Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Project Status</h2>
          {data.portfolio.projects_2025.map((p, i) => (
            <div key={i} className="mb-3">
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm">{p.status} | {p.progress}% | {p.rag}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Cost vs Budget</h2>
          {data.portfolio.projects_2025.map((p, i) => (
            <div key={i} className="flex justify-between border-b py-2">
              <span>{p.name}</span>
              <span>
                {p.actual_cost} / {p.budget} ({p.cost_variance_pct}%)
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
