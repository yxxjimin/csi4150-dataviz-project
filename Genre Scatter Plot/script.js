const width = 700;
const height = 600;
const margin = {top: 20, right: 150, bottom: 40, left: 40};

function createSvg(containerId) {
    return d3.select(containerId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
}

function aggregateGenreData(data) {
    const aggregation = d3.rollups(
        data,
        v => ({
            count: v.length,
            averageMetaScore: d3.mean(v, d => d.meta_score),
            averageUserReview: d3.mean(v, d => d.user_review)
        }),
        d => d.genre
    );
    return aggregation.map(([key, value]) => ({ genre: key, ...value }));
}

function drawScatterPlot(svg, data) {
    const x = d3.scaleLinear()
        .domain([7.5, 8.7]) // Adjust based on your data range
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([87, 93]) // Adjust based on your data range
        .range([height, 0]);

    const size = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.count)])
        .range([0, 20]); // Adjust size range as needed

    const color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data.map(d => d.genre));

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.averageUserReview))
        .attr("cy", d => y(d.averageMetaScore))
        .attr("r", d => size(d.count * 15))
        .style("fill", d => color(d.genre))
        .style("opacity", 0.7);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Average User Review");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Average Meta Score");

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 40}, 0)`);

    data.forEach((d, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        legendRow.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", color(d.genre))
            .attr("opacity", 0.7);

        legendRow.append("text")
            .attr("x", 15)
            .attr("y", 10)
            .text(d.genre)
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");
    });
}

d3.csv("../visualizer_genre.csv").then((dataset) => {
    dataset.forEach(d => {
        d.release_year = new Date(d.release_date).getFullYear();
        d.meta_score = +d.meta_score; // Assuming meta_score is a numerical value in the dataset
        d.user_review = +d.user_review; // Assuming user_review is a numerical value in the dataset
    });

    const genreData = aggregateGenreData(dataset);
    const svg = createSvg("#chart-scatter");

    drawScatterPlot(svg, genreData);
});
