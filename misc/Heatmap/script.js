const width = 1200;
const height = 500;
const margin = { top: 20, right: 30, bottom: 30, left: 40 };
const gridSize = 20;

d3.csv("../visualizer_preprocess.csv").then((dataset) => {
    showHeatmap(dataset);
});

function showHeatmap(data) {
    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right + 500)
        .attr("height", height + margin.top + margin.bottom + 200)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([3, d3.max(data, (d) => +d.user_review)])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([84, d3.max(data, (d) => +d.meta_score)])
        .range([height, 0]);

    const xAxis = d3.axisBottom().scale(xScale);
    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    const yAxis = d3.axisLeft().scale(yScale);
    const yAxisGroup = svg.append("g").call(yAxis);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(data, d => +d.user_review)]);

    const xBins = d3.bin()
        .value(d => +d.user_review)
        .domain(xScale.domain())
        .thresholds(xScale.ticks(width / gridSize))(data);

    const heatmapData = [];
    xBins.forEach(xBin => {
        const yBins = d3.bin()
            .value(d => +d.meta_score)
            .domain(yScale.domain())
            .thresholds(yScale.ticks(height / gridSize))(xBin);
        
        yBins.forEach(yBin => {
            heatmapData.push({
                x0: xBin.x0,
                x1: xBin.x1,
                y0: yBin.x0,
                y1: yBin.x1,
                length: yBin.length
            });
        });
    });

    svg.selectAll(".heatmap-rect")
        .data(heatmapData)
        .enter().append("rect")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.y1))
        .attr("width", d => xScale(d.x1) - xScale(d.x0))
        .attr("height", d => yScale(d.y0) - yScale(d.y1))
        .attr("fill", d => colorScale(d.length));

    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis y-axis")
        .call(yAxis);
}
