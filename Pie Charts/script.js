const width = 600;
const height = 300;
const margin = 40;
const radius = Math.min(width, height) / 2 - margin;

function createSvg(containerId) {
    return d3.select(containerId)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);
}

function aggregateData(data, key) {
    const aggregation = d3.rollup(
        data,
        v => v.length,
        d => d[key]
    );
    return Array.from(aggregation, ([key, value]) => ({ key, value }));
}

function drawPieChart(svg, data) {
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.key))
        .range(d3.schemeCategory10);

    const pie = d3.pie()
        .value(d => d.value);

    const data_ready = pie(data);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    svg.selectAll('path')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.key))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${radius + 10}, -${radius})`);

    const legendItem = legend.selectAll(".legend-item")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItem.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d => color(d.key));

    legendItem.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(d => d.key)
        .style("font-size", 12);
}

d3.csv("../visualizer_genre.csv").then((dataset) => {
    dataset.forEach(d => {
        d.release_year = new Date(d.release_date).getFullYear();
    });

    const genreData = aggregateData(dataset, 'genre');
    const targetAgeData = aggregateData(dataset, 'target_age');

    const svgGenre = createSvg("#chart-genre");
    const svgTargetAge = createSvg("#chart-target-age");

    drawPieChart(svgGenre, genreData);
    drawPieChart(svgTargetAge, targetAgeData);
});
