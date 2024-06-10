import * as d3 from "d3";
import { useEffect } from 'react';

const width = window.innerWidth * 0.6;
const height = 500;
const margin = { 
  top: 20, 
  right: 150, 
  bottom: 30, 
  left: 50 
};

function showLineChart(data) {
  const svg = d3
      .select("#line-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const xScale = d3.scaleTime()
      .domain([
          d3.min(data, d => d3.min(d.values, v => v.year)),
          d3.max(data, d => d3.max(d.values, v => v.year))
      ])
      .range([0, width]);

  const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(d.values, v => v.count))])
      .range([height, 0]);

  const xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format("d"));
  const xAxisGroup = svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

  const yAxis = d3.axisLeft().scale(yScale);
  const yAxisGroup = svg.append("g").call(yAxis);

//   const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  const colorScale = d3.scaleOrdinal([
    '#4981cf',
    '#c78740',
    '#6bc65d',
    '#c45162',
    '#7c44c1',
    '#4040c2',
    '#b849c0',
    '#9c9c9c',
    '#c9c959',
    '#6bc6c8',
    ])
      .domain(data.map(d => d.genre));

  const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.count));

  let activeGenre = null;

  const paths = svg.selectAll(".line")
      .data(data)
      .enter().append("path")
      .attr("class", "line")
      .attr("d", d => line(d.values))
      .style("stroke", d => colorScale(d.genre))
      .style("fill", "none")
      .style("stroke-width", 2);

  // const legend = svg.selectAll(".legend")
  const legend = d3.select("#line-legends")
      .append("svg")
      .attr("height", 400)
      .append("g")
      .selectAll(".legend")
      .data(data)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${0}, ${i * 30})`)
      .on("click", function(event, d) {
          if (activeGenre === d.genre) {
              activeGenre = null;
              paths.style("opacity", 1);
          } else {
              activeGenre = d.genre;
              paths.style("opacity", 0.1);
              paths.filter(p => p.genre === d.genre).style("opacity", 1);
          }
      });

  legend.append("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", d => colorScale(d.genre));

  legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .style("fill", "#d5d5d5")
      .text(d => d.genre);
}


export const LineChart = () => {

  // Hooks
  useEffect(() => {
    d3.csv("/csi4150-dataviz-project/visualizer_genre.csv").then((dataset) => {
      dataset.forEach(d => {
          d.release_year = new Date(d.release_date).getFullYear();
      });
  
      const years = d3.range(d3.min(dataset, d => d.release_year), d3.max(dataset, d => d.release_year) + 1);
      
      const dataByGenreAndYear = d3.rollups(
          dataset,
          v => v.length,
          d => d.genre,
          d => d.release_year
      ).map(([key, values]) => ({
          genre: key,
          values: years.map(year => ({
              year: year,
              count: values.find(v => v[0] === year) ? values.find(v => v[0] === year)[1] : 0
          }))
      }));
  
      showLineChart(dataByGenreAndYear);
  });
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold my-6 font-display text-center">
        Trending
      </h1>
      <p className="my-3 text-center font-display">
        연도에 따라 각 장르별로 출시된 게임의 수가 어떻게 변화했는 지 확인할 수 있습니다.
      </p>
      <p className="mt-3 text-center font-display">
        특히 2017~2019년에 출시된 게임의 수가 급증한 것을 알 수 있는데, 해당 시기에 게임 산업이 급성장했음을 알 수 있습니다.
      </p>
      <div className="relative w-screen flex space-x-6 my-40 px-20 font-display">
        
        <div 
          id="line-chart"
          className="w-9/12 flex flex-col justify-center"
        >  
        </div>
        <div className="w-3/12 flex flex-col space-y-4 text-left bg-dark-mist p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Genre</h3>
          <div id="line-legends"></div>
        </div>
      </div>
    </>
  );
};
