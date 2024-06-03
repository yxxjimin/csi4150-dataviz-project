const width = 1000;
const height = 500;
const margin = { top: 20, right: 150, bottom: 30, left: 50 };

d3.csv("../visualizer_preprocess.csv").then((dataset) => {
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

function showLineChart(data) {
    const svg = d3
        .select("#chart")
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

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
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

    const legend = svg.selectAll(".legend")
        .data(data)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 20}, ${i * 20})`)
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
        .text(d => d.genre);
}
