const width = 300;
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

    svg.selectAll('text')
        .data(data_ready)
        .enter()
        .append('text')
        .text(d => d.data.key)
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", 12);
}

d3.csv("../visualizer_preprocess.csv").then((dataset) => {
    dataset.forEach(d => {
        d.release_year = new Date(d.release_date).getFullYear();
    });

    const genreData = aggregateData(dataset, 'genre');
    const platformData = aggregateData(dataset, 'platform');
    const targetAgeData = aggregateData(dataset, 'target_age');

    const svgGenre = createSvg("#chart-genre");
    const svgPlatform = createSvg("#chart-platform");
    const svgTargetAge = createSvg("#chart-target-age");

    drawPieChart(svgGenre, genreData);
    drawPieChart(svgPlatform, platformData);
    drawPieChart(svgTargetAge, targetAgeData);
});