import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const LatestStatsGraph = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/stats/latest`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setData(result.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  // Prepare data for graph
  const graphData = data.map((item) => ({
    portal: item.portal,
    pending: item.pending,
    resolve: item.resolve,
    total: item.total,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-blue-700">
        Latest Portal Stats
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={graphData}>
          <XAxis dataKey="portal" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="pending" fill="#f59e42" name="Pending">
            <LabelList
              dataKey="pending"
              position="top"
              formatter={(value) => value}
            />
          </Bar>
          <Bar dataKey="resolve" fill="#42c5f5" name="Resolve">
            <LabelList
              dataKey="resolve"
              position="top"
              formatter={(value) => value}
            />
          </Bar>
          <Bar dataKey="total" fill="#42f57b" name="Total">
            <LabelList
              dataKey="total"
              position="top"
              formatter={(value) => value}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LatestStatsGraph;
