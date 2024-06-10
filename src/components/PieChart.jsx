import * as d3 from "d3";
import { useEffect } from "react";

const platforms = ["PC", "Switch", "PlayStation"];
const targetAges = ["E", "M", "T"];

function createPieChart(platform, selector, data) {
  const filteredData = data.filter(d => d.platform === platform);
  const counts = targetAges.map(age => ({
      age: age,
      count: filteredData.filter(d => d.target_age === age).length
  }));

  const width = window.innerWidth * 0.1;
  const height = window.innerWidth * 0.1;
  const radius = Math.min(width, height) / 2;

  const svg = d3.select(selector)
      .append("svg")
      .attr("width", width + 100)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const color = d3.scaleOrdinal()
      .domain(targetAges)
      .range(d3.schemeCategory10);

  const pie = d3.pie()
      .value(d => d.count)
      .sort((a, b) => targetAges.indexOf(a.age) - targetAges.indexOf(b.age));

  const path = d3.arc()
      .outerRadius(radius)
      .innerRadius(0);

  const arc = svg.selectAll("arc")
      .data(pie(counts))
      .enter()
      .append("g")
      .attr("class", "arc");

  arc.append("path")
      .attr("d", path)
      .attr("fill", d => color(d.data.age));

  const legend = svg.selectAll(".legend")
      .data(counts)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(${radius + 20}, ${i * 20 - radius / 2})`)
      .attr("class", "legend");

  legend.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", d => color(d.age));

  legend.append("text")
      .attr("x", 12)
      .attr("y", 5)
      .attr("dy", ".35em")
      .style("fill", "#d5d5d5")
      .text(d => `${d.age}`);
}


export const PieChart = () => {

  // Hooks
  useEffect(() => {
    d3.csv("/csi4150-dataviz-project/visualizer_genre.csv").then(function(data) {
      platforms.forEach(platform => {
        createPieChart(platform, `#pie-chart-${platform.toLowerCase()}`, data);
      });
    });
  }, [])

  return (
    <div className="relative w-screen text-center flex justify-between items-center space-y-6 space-x-6 my-32 px-20 font-display">
      <div className="w-1/2 flex">
        <div className="w-1/3">
          <h3>PC</h3>
          <div id="pie-chart-pc" className="chart"></div>
        </div>
        <div className="w-1/3">
          <h3>Switch</h3>
          <div id="pie-chart-switch" className="chart"></div>
        </div>
        <div className="w-1/3">
          <h3>PlayStation</h3>
          <div id="pie-chart-playstation" className="chart"></div>
        </div>
      </div>
      <div className="w-1/2 flex flex-col text-left space-y-4">
        <h2 className="text-lg font-bold mb-2">* 각 플랫폼(PC, Switch, PlayStation)별 게임 등급 분포</h2>
        <p>PC와 PlayStation에서는 성인 대상 게임(M)이 가장 높은 비율을 차지하고 있습니다. 반면, Switch에서는 전연령 대상 게임(E)이 가장 높은 비율을 차지하고 있습니다</p>
      </div>
    </div>
  );
};
