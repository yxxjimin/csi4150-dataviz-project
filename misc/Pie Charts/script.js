const platforms = ["PC", "Switch", "PlayStation"];
const targetAges = ["E", "M", "T"];

d3.csv("../visualizer_genre.csv").then(function(data) {
    platforms.forEach(platform => {
        createPieChart(platform, `#pie-chart-${platform.toLowerCase()}`, data);
    });
});

function createPieChart(platform, selector, data) {
    const filteredData = data.filter(d => d.platform === platform);
    const counts = targetAges.map(age => ({
        age: age,
        count: filteredData.filter(d => d.target_age === age).length
    }));

    const width = 300;
    const height = 300;
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
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => color(d.age));

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(d => `${d.age}`);
}
