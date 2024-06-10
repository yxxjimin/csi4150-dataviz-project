import * as d3 from "d3";
import { useEffect } from "react";

const showIntroLineChart = () => {

  // Data
  const dates = [
    '2007.01', '2008.01', '2009.01', '2010.01', '2011.02', '2012.02', '2013.02',
    '2014.02', '2015.03', '2016.03', '2017.03', '2018.03', '2019.10', '2020.01',
    '2020.03', '2020.06', '2020.10', '2020.12'
  ];
  const values = [
    285, 619, 1500, 2500, 3170, 4670, 5790, 6920, 8580, 11350, 11250, 16450, 14800,
    16260, 19830, 20590, 21860, 23960
  ];

  // Convert data
  const data = dates.map((date, i) => ({
    date: d3.timeParse("%Y.%m")(date),
    val: values[i]
  }));

  // Set dimensions and margins
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const width = window.innerWidth * 0.25;
  const height = window.innerHeight * 0.2;

  // Create SVG container
  const svg = d3.select("#intro-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create scales
  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.val)])
    .range([height, 0]);

  // // Create axes
  // const xAxis = d3.axisBottom(x);
  // const yAxis = d3.axisLeft(y);

  // // Add x-axis to the svg
  // svg.append("g")
  //   .attr("transform", `translate(0,${height})`)
  //   .call(xAxis);

  // // Add y-axis to the svg
  // svg.append("g")
  //   .call(yAxis);
  const xAxis = d3.axisBottom().scale(xScale).tickSize(0).tickFormat(() => '');
  const xAxisGroup = svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

  const yAxis = d3.axisLeft().scale(yScale).tickSize(0).tickFormat(() => '');;
  const yAxisGroup = svg.append("g").call(yAxis);

  // Create line generator
  const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.val));

  // Add the line to the svg
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  // Add axis names
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", (width + margin.left) / 2)
    .attr("y", height + margin.bottom - 10)
    .text("Time")
    .style("fill", "#d5d5d5");

  svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height) / 2 + margin.top)
    .attr("y", -margin.left + 30)
    .text("Users")
    .style("fill", "#d5d5d5");
}

export const IntroChart = () => {

  useEffect(() => {
    showIntroLineChart()
  }, []);

  return (
    <div id="intro-chart"></div>
  );
};
