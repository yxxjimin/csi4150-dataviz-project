import * as d3 from "d3";
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import { useEffect } from "react";

const width = window.innerWidth * 0.55;
const height = window.innerHeight * 0.6;
const barChartHeight = 300;
const margin = { 
  top: window.innerHeight * 0.1, 
  right: window.innerWidth * 0.2,
  bottom: 0, 
  left: window.innerWidth * 0.05
};

let selectedPlatforms = [];
let selectedAges = [];
let zoomLevelX = 1;
let zoomLevelY = 1;
let brushActive = true;
let selectedPoints = new Set();
let activeGenre = null;
let showSelectedOnly = false;
let selectedReleaseDateRange = [1996, 2024];

function createCheckboxes(data, key, containerId, selectedItems) {
  const items = Array.from(new Set(data.map(d => d[key])));
  const checkboxContainer = d3.select(`#${containerId}`);

  checkboxContainer.selectAll("label")
    .data(items)
    .enter()
    .append("label")
    .text(d => d)
    .append("input")
    .attr("type", "checkbox")
    .attr("value", d => d)
    .attr("checked", true)
    .on("change", function() {
      selectedItems.length = 0;
      checkboxContainer.selectAll("input").each(function(d) {
        if (d3.select(this).property("checked")) {
          selectedItems.push(d);
          }
          });
          updateScatterPlot(data);
          });
}

function createSlider(data) {
  const slider = document.getElementById('releaseDateSlider');
  noUiSlider.create(slider, {
    start: selectedReleaseDateRange,
    connect: true,
    range: {
      'min': 1996,
      'max': 2024
    },
    step: 1,
    tooltips: true,
    format: {
      to: function (value) {
        return Math.round(value);
      },
      from: function (value) {
        return Number(value);
      }
    }
  });

  slider.noUiSlider.on('update', function(values) {
    selectedReleaseDateRange = values.map(v => parseInt(v));
    d3.select("#sliderValue").text(`${selectedReleaseDateRange[0]} - ${selectedReleaseDateRange[1]}`);
    updateScatterPlot(data);
  });
}

function updateSelectedGamesBox() {
  const selectedGamesDiv = d3.select("#selectedGames");
  selectedGamesDiv.html(Array.from(selectedPoints).map(p => p.split('-')[0]).join(", "));
}

function drawBarCharts(selectedData) {
  const barChartWidth = window.innerWidth * 0.4;
  const barChartMargin = { 
    top: 20, 
    right: window.innerWidth * 0.05, 
    bottom: 50, 
    left: window.innerWidth * 0.05 
  };
  const barChartInnerWidth = barChartWidth - barChartMargin.left - barChartMargin.right;
  const barChartInnerHeight = barChartHeight - barChartMargin.top - barChartMargin.bottom;

  const minMetaScore = d3.min(selectedData, d => +d.meta_score) - 1;
  const minUserReview = d3.min(selectedData, d => +d.user_review) - 0.1;

  const barChartSvgMeta = d3.select("#barChartMeta")
    .html("") // Clear previous bar chart
    .append("svg")
    .attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
    .attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom)
    .append("g")
    .attr("transform", `translate(${barChartMargin.left}, ${barChartMargin.top})`);

  const barChartSvgUser = d3.select("#barChartUser")
    .html("") // Clear previous bar chart
    .append("svg")
    .attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
    .attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom)
    .append("g")
    .attr("transform", `translate(${barChartMargin.left}, ${barChartMargin.top})`);

  const xBarScale = d3.scaleBand()
    .domain(selectedData.map(d => d.name))
    .range([0, barChartInnerWidth])
    .padding(0.2);  // Adjust padding to make bars skinnier

  const yBarScaleMeta = d3.scaleLinear()
    .domain([minMetaScore, d3.max(selectedData, d => +d.meta_score)])
    .nice()
    .range([barChartInnerHeight, 0]);

  const yBarScaleUser = d3.scaleLinear()
    .domain([minUserReview, d3.max(selectedData, d => +d.user_review)])
    .nice()
    .range([barChartInnerHeight, 0]);

  barChartSvgMeta.append("g")
    .attr("transform", `translate(0, ${barChartInnerHeight})`)
    .call(d3.axisBottom(xBarScale))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  barChartSvgMeta.append("g")
    .call(d3.axisLeft(yBarScaleMeta));

  barChartSvgMeta.selectAll(".bar")
    .data(selectedData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xBarScale(d.name))
    .attr("y", d => yBarScaleMeta(+d.meta_score))
    .attr("width", xBarScale.bandwidth())
    .attr("height", d => barChartInnerHeight - yBarScaleMeta(+d.meta_score))
    .attr("fill", "steelblue");

  barChartSvgUser.append("g")
    .attr("transform", `translate(0, ${barChartInnerHeight})`)
    .call(d3.axisBottom(xBarScale))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  barChartSvgUser.append("g")
    .call(d3.axisLeft(yBarScaleUser));

  barChartSvgUser.selectAll(".bar")
    .data(selectedData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xBarScale(d.name))
    .attr("y", d => yBarScaleUser(+d.user_review))
    .attr("width", xBarScale.bandwidth())
    .attr("height", d => barChartInnerHeight - yBarScaleUser(+d.user_review))
    .attr("fill", "orange");
}

function showScatterPlot(data) {
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const xScale = d3.scaleLinear()
    .domain([6, d3.max(data, (d) => +d.user_review)])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([84, d3.max(data, (d) => +d.meta_score)])
    .range([height, 0]);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(data.map(d => d.genre));

  const shapeScale = d3.scaleOrdinal(d3.symbols)
    .domain(data.map(d => d.platform));

  const symbol = d3.symbol();

  const xAxis = d3.axisBottom().scale(xScale);
  const xAxisGroup = svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  const yAxis = d3.axisLeft().scale(yScale);
  const yAxisGroup = svg.append("g").call(yAxis);

  const pointMap = {};
  data.forEach(d => {
    const key = `${d.user_review}-${d.meta_score}`;
    if (!pointMap[key]) {
      pointMap[key] = [];
    }
    pointMap[key].push(d);
  });

  function adjustPadding(zoomLevelX, zoomLevelY) {
    const paddingX = 0.025 / zoomLevelX;
    const paddingY = 0.25 / zoomLevelY;
    const updatedData = [];
    Object.keys(pointMap).forEach(key => {
      const points = pointMap[key];
      const n = points.length;
      const side = Math.ceil(Math.sqrt(n));
      const halfSide = (side - 1) / 2;

      points.forEach((d, i) => {
        const row = Math.floor(i / side);
        const col = i % side;
        d.adjusted_user_review = +d.user_review + (col - halfSide) * paddingX;
        d.adjusted_meta_score = +d.meta_score + (row - halfSide) * paddingY;
        updatedData.push(d);
      });
    });
  
    return updatedData;
  }

  const updatedData = adjustPadding(zoomLevelX, zoomLevelY);

  const shapes = svg.selectAll(".point")
    .data(updatedData)
    .enter()
    .append("path")
    .attr("class", "point")
    .attr("d", d => symbol.type(shapeScale(d.platform))())
    .attr("transform", d => `translate(${xScale(+d.adjusted_user_review)}, ${yScale(+d.adjusted_meta_score)})`)
    .attr("fill", d => colorScale(d.genre))
    .on("click", function(event, d) {
      const pointKey = `${d.name}-${d.platform}`;
      const isSelected = selectedPoints.has(pointKey);
      if (isSelected) {
        selectedPoints.delete(pointKey);
        d3.select(this).attr("fill", colorScale(d.genre));
      } else {
        selectedPoints.add(pointKey);
        d3.select(this).attr("fill", "black");
      }
  
      updateSelectedGamesBox();
      drawBarCharts(data.filter(d => selectedPoints.has(`${d.name}-${d.platform}`)));
    })
    .on("mouseover", (event, d) => {
      d3.select("#tooltip").transition()
        .duration(200)
        .style("opacity", .9);
      d3.select("#tooltip").html(`
        <table class="table-auto text-sm text-black">
          <tr>
            <td class="border border-slate-500 bg-slate-200">Name</td>
            <td class="border border-slate-500">${d.name}</td>
          </tr>
          <tr>
            <td class="border border-slate-500 bg-slate-200">Platform</td>
            <td class="border border-slate-500">${d.platform}</td>
          </tr>
          <tr>
            <td class="border border-slate-500 bg-slate-200">Release Date</td>
            <td class="border border-slate-500">${d.release_date}</td>
          </tr>
          <tr>
            <td class="border border-slate-500 bg-slate-200">Genre</td>
            <td class="border border-slate-500">${d.genre}</td>
          </tr>
          <tr>
            <td class="border border-slate-500 bg-slate-200">Meta Score</td>
            <td class="border border-slate-500">${d.meta_score}</td>
          </tr>
          <tr>
            <td class="border border-slate-500 bg-slate-200">User Review</td>
            <td class="border border-slate-500">${d.user_review}</td>
          </tr>
        </table>`)
        .style("left", (event.clientX + 10) + "px")
        .style("top", (event.clientY - 25) + "px");
      })
      .on("mousemove", (event) => {
        d3.select("#tooltip").style("left", (event.clientX + 10) + "px")
          .style("top", (event.clientY - 25) + "px");
      })
      .on("mouseout", () => {
        d3.select("#tooltip").transition()
          .duration(500)
          .style("opacity", 0);
      });

  // Initial average lines
  const avgUserReview = d3.mean(data, d => +d.user_review);
  const avgMetaScore = d3.mean(data, d => +d.meta_score);

  svg.append("line")
    .attr("id", "x-avg")
    .attr("class", "avg-line")
    .attr("x1", xScale(avgUserReview))
    .attr("x2", xScale(avgUserReview))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "grey")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4");

  svg.append("line")
    .attr("id", "y-avg")
    .attr("class", "avg-line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", yScale(avgMetaScore))
    .attr("y2", yScale(avgMetaScore))
    .attr("stroke", "grey")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4");

  // const legend = svg.selectAll(".legend")
  const legend = d3.select("#legends")
    .append("svg")
    .attr("height", 220)
    .append("g")
    .selectAll(".legend")
    .data([...colorScale.domain(), "Selected"])
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`)
    .on("click", function(event, genre) {
      const shapes = svg.selectAll(".point");
      if (genre === "Selected") {
        if (showSelectedOnly) {
          shapes.style("opacity", 1);
          showSelectedOnly = false;
        } else {
          shapes.style("opacity", d => selectedPoints.has(`${d.name}-${d.platform}`) ? 1 : 0.1);
          showSelectedOnly = true;
        }
      } else {
        if (activeGenre === genre) {
          shapes.style("opacity", 1);
          activeGenre = null;
        } else {
          shapes.style("opacity", d => d.genre === genre ? 1 : 0.1);
          activeGenre = genre;
        }
      }
    });

  legend.append("rect")
    .attr("x", 0)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", d => d === "Selected" ? "black" : colorScale(d));

  legend.append("text")
    .attr("x", 25)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .style("fill", "#d5d5d5")
    .text(d => d);

  const brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on("end", brushended);

  let brushGroup = svg.append("g")
    .attr("class", "brush")
    .call(brush);

  d3.select("#reset-zoom")
    .text("Reset Zoom")
    .on("click", resetZoom);

  d3.select("body").on("keydown", function(event) {
    if (event.key === "t") {
      toggleBrush();
    }
  });

  function toggleBrush() {
    if (brushActive) {
      brushGroup.remove();
    } else {
      brushGroup = svg.append("g")
        .attr("class", "brush")
        .call(brush);
    }
    brushActive = !brushActive;
  }

  function brushended(event) {
    if (!event.selection) return;
    if (!brushActive) return;
    const [[x0, y0], [x1, y1]] = event.selection;
    const selectedData = data.filter(d => {
      const x = xScale(+d.user_review);
      const y = yScale(+d.meta_score);
      return x0 <= x && x <= x1 && y0 <= y && y <= y1;
    });

    xScale.domain([x0, x1].map(xScale.invert, xScale));
    yScale.domain([y1, y0].map(yScale.invert, yScale));

    zoomLevelX = width / (x1 - x0);
    zoomLevelY = height / (y1 - y0);

    svg.select(".brush").call(brush.move, null);

    zoom(selectedData);
  }

  function zoom(selectedData) {
    const t = svg.transition().duration(750);
    xAxisGroup.transition(t).call(xAxis);
    yAxisGroup.transition(t).call(yAxis);

    const updatedData = adjustPadding(zoomLevelX, zoomLevelY);

    svg.selectAll(".point").transition(t)
      .attr("transform", d => `translate(${xScale(+d.adjusted_user_review)}, ${yScale(+d.adjusted_meta_score)})`)
      .attr("d", d => selectedData.includes(d) ? symbol.type(shapeScale(d.platform))() : "")
      .on("end", attachTooltip);

    if (selectedData.length > 0) {
      // const avgUserReview = d3.mean(selectedData, d => +d.user_review);
      // const avgMetaScore = d3.mean(selectedData, d => +d.meta_score);
    
      svg.select("#x-avg").transition(t)
        .attr("class", "avg-line")
        .attr("x1", xScale(avgUserReview))
        .attr("x2", xScale(avgUserReview))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "grey")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4");

      svg.select("#y-avg").transition(t)
        .attr("class", "avg-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(avgMetaScore))
        .attr("y2", yScale(avgMetaScore))
        .attr("stroke", "grey")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4");
    }
  }

  function resetZoom() {
    xScale.domain([6, d3.max(data, (d) => +d.user_review)]);
    yScale.domain([84, d3.max(data, (d) => +d.meta_score)]);

    zoomLevelX = 1;
    zoomLevelY = 1;

    const t = svg.transition().duration(750);
    xAxisGroup.transition(t).call(xAxis);
    yAxisGroup.transition(t).call(yAxis);

    const updatedData = adjustPadding(zoomLevelX, zoomLevelY);

    svg.selectAll(".point").transition(t)
    .attr("transform", d => `translate(${xScale(+d.adjusted_user_review)}, ${yScale(+d.adjusted_meta_score)})`)
    .attr("d", d => symbol.type(shapeScale(d.platform))())
    .on("end", attachTooltip);
    
    // Re-add the initial average lines
    const avgUserReview = d3.mean(data, d => +d.user_review);
    const avgMetaScore = d3.mean(data, d => +d.meta_score);
    
    svg.select("#x-avg").transition(t)
      .attr("class", "avg-line")
      .attr("x1", xScale(avgUserReview))
      .attr("x2", xScale(avgUserReview))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "grey")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4");

    svg.select("#y-avg").transition(t)
      .attr("class", "avg-line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(avgMetaScore))
      .attr("y2", yScale(avgMetaScore))
      .attr("stroke", "grey")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4");
  }

  function attachTooltip() {
    svg.selectAll(".point")
      .on("mouseover", (event, d) => {
        d3.select("#tooltip").transition()
          .duration(200)
          .style("opacity", .9);
        d3.select("#tooltip").html(`
          <table class="table-auto text-sm text-black">
            <tr>
              <td class="border border-slate-500 bg-slate-200">Name</td>
              <td class="border border-slate-500">${d.name}</td>
            </tr>
            <tr>
              <td class="border border-slate-500 bg-slate-200">Platform</td>
              <td class="border border-slate-500">${d.platform}</td>
            </tr>
            <tr>
              <td class="border border-slate-500 bg-slate-200">Release Date</td>
              <td class="border border-slate-500">${d.release_date}</td>
            </tr>
            <tr>
              <td class="border border-slate-500 bg-slate-200">Genre</td>
              <td class="border border-slate-500">${d.genre}</td>
            </tr>
            <tr>
              <td class="border border-slate-500 bg-slate-200">Meta Score</td>
              <td class="border border-slate-500">${d.meta_score}</td>
            </tr>
            <tr>
              <td class="border border-slate-500 bg-slate-200">User Review</td>
              <td class="border border-slate-500">${d.user_review}</td>
            </tr>
          </table>`)
          .style("left", (event.clientX + 10) + "px")
          .style("top", (event.clientY - 25) + "px");
        })
        .on("mousemove", (event) => {
          d3.select("#tooltip").style("left", (event.clientX + 10) + "px")
            .style("top", (event.clientY - 25) + "px");
        })
        .on("mouseout", () => {
          d3.select("#tooltip").transition()
            .duration(500)
            .style("opacity", 0);
        });
  }

  attachTooltip();
}

function updateScatterPlot(data) {
  const filteredData = data.filter(d => 
    selectedPlatforms.includes(d.platform) && 
    selectedAges.includes(d.target_age) && 
    new Date(d.release_date).getFullYear() >= selectedReleaseDateRange[0] && 
    new Date(d.release_date).getFullYear() <= selectedReleaseDateRange[1]
  );

  const svg = d3.select("#chart svg g");

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(data.map(d => d.genre));

  const shapeScale = d3.scaleOrdinal(d3.symbols)
    .domain(data.map(d => d.platform));

  const symbol = d3.symbol();

  const xScale = d3.scaleLinear()
    .domain([6, d3.max(data, (d) => +d.user_review)])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([84, d3.max(data, (d) => +d.meta_score)])
    .range([height, 0]);

  const shapes = svg.selectAll(".point")
    .data(filteredData, d => d.name);

  shapes.exit().remove();

  shapes.enter()
    .append("path")
    .attr("class", "point")
    .attr("d", d => symbol.type(shapeScale(d.platform))())
    .attr("transform", d => `translate(${xScale(+d.adjusted_user_review)}, ${yScale(+d.adjusted_meta_score)})`)
    .attr("fill", d => colorScale(d.genre))
    .merge(shapes)
    .attr("d", d => symbol.type(shapeScale(d.platform))())
    .attr("transform", d => `translate(${xScale(+d.adjusted_user_review)}, ${yScale(+d.adjusted_meta_score)})`)
    .attr("fill", d => colorScale(d.genre));

  shapes.on("click", function(event, d) {
    const pointKey = `${d.name}-${d.platform}`;
    const isSelected = selectedPoints.has(pointKey);
    if (isSelected) {
      selectedPoints.delete(pointKey);
      d3.select(this).attr("fill", colorScale(d.genre));
    } else {
      selectedPoints.add(pointKey);
      d3.select(this).attr("fill", "black");
    }
    updateSelectedGamesBox();
    drawBarCharts(filteredData.filter(d => selectedPoints.has(`${d.name}-${d.platform}`)));
  });

  shapes.on("mouseover", (event, d) => {
    d3.select("#tooltip").transition()
      .duration(200)
      .style("opacity", .9);
    d3.select("#tooltip").html(`
      <table class="table-auto text-sm text-black">
        <tr>
          <td class="border border-slate-500 bg-slate-200">Name</td>
          <td class="border border-slate-500">${d.name}</td>
        </tr>
        <tr>
          <td class="border border-slate-500 bg-slate-200">Platform</td>
          <td class="border border-slate-500">${d.platform}</td>
        </tr>
        <tr>
          <td class="border border-slate-500 bg-slate-200">Release Date</td>
          <td class="border border-slate-500">${d.release_date}</td>
        </tr>
        <tr>
          <td class="border border-slate-500 bg-slate-200">Genre</td>
          <td class="border border-slate-500">${d.genre}</td>
        </tr>
        <tr>
          <td class="border border-slate-500 bg-slate-200">Meta Score</td>
          <td class="border border-slate-500">${d.meta_score}</td>
        </tr>
        <tr>
          <td class="border border-slate-500 bg-slate-200">User Review</td>
          <td class="border border-slate-500">${d.user_review}</td>
        </tr>
      </table>`)
      .style("left", (event.clientX + 10) + "px")
      .style("top", (event.clientY - 25) + "px");
  });

  shapes.on("mousemove", (event) => {
    d3.select("#tooltip").style("left", (event.clientX + 10) + "px")
      .style("top", (event.clientY - 25) + "px");
  });

  shapes.on("mouseout", () => {
    d3.select("#tooltip").transition()
      .duration(500)
      .style("opacity", 0);
  });

  if (filteredData.length > 0) {
    const avgUserReview = d3.mean(filteredData, d => +d.user_review);
    const avgMetaScore = d3.mean(filteredData, d => +d.meta_score);

    // svg.append("line")
    svg.select("#x-avg")
      .attr("x1", xScale(avgUserReview))
      .attr("x2", xScale(avgUserReview))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "grey")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4");

    svg.select("#y-avg")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(avgMetaScore))
      .attr("y2", yScale(avgMetaScore))
      .attr("stroke", "grey")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4");
  }
}


export const ScatterPlot = () => {

  // Hooks
  useEffect(() => {
    d3.csv("/visualizer_genre.csv")
      .then((dataset) => {
        selectedPlatforms = Array.from(new Set(dataset.map(d => d.platform)));
        selectedAges = Array.from(new Set(dataset.map(d => d.target_age)));
        createCheckboxes(dataset, "platform", "checkboxes", selectedPlatforms);
        createCheckboxes(dataset, "target_age", "ageCheckboxes", selectedAges);
        createSlider(dataset);
        showScatterPlot(dataset);
        
        const filteredData = dataset.filter(d => 
          selectedPlatforms.includes(d.platform) && 
          selectedAges.includes(d.target_age) && 
          new Date(d.release_date).getFullYear() >= selectedReleaseDateRange[0] && 
          new Date(d.release_date).getFullYear() <= selectedReleaseDateRange[1]
        );
        drawBarCharts(filteredData.filter(d => selectedPoints.has(`${d.name}-${d.platform}`)));
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="relative w-screen text-center flex flex-col justify-center items-center font-display">
      <h1 className="text-3xl font-bold">
        Drag, Toggle and Select
      </h1>
      <div className="flex w-full p-20">
        <div 
          id="chart"
          className="w-9/12 flex flex-col justify-center"
        ></div>
        <div className="w-3/12 flex flex-col space-y-4 text-left bg-dark-mist p-6 rounded-lg">
          <div id="checkboxes" className="flex flex-col">
            <h3 className="text-lg font-bold mb-2">Platforms</h3>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Target Age</h3>
            <div id="ageCheckboxes" className="flex justify-between"></div>
          </div>
          <h3 className="text-lg font-bold mb-2">Release Date</h3>
          <div id="sliderContainer" className="w-full flex flex-col items-center">
            <div id="releaseDateSlider" className="w-4/5 flex justify-center"></div>
            <span id="sliderValue">2020</span>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Genre</h3>
            <div id="legends"></div>
          </div>
          <button 
            id="reset-zoom"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Reset Zoom
          </button>
        </div>
      </div>
      <div 
        id="tooltip"
        className="absolute z-10 opacity-0 bg-white"
      ></div>
      <div
        className="w-full flex jusitfy-around"
        >
        <p className="w-1/2 text-center">Critic Score</p>
        <p className="w-1/2 text-center">User Score</p>
      </div>
      <div
        className="w-full flex jusitfy-between"
      >
        <div id="barChartMeta"></div>
        <div id="barChartUser"></div>
      </div>
    </div>
  );
};

