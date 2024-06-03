const width = 800;
const height = 400;
const margin = { top: 20, right: 30, bottom: 40, left: 50 };

d3.csv("../visualizer_preprocess.csv").then((dataset) => {
    const dataByGenre = d3.rollups(
        dataset,
        v => d3.mean(v, d => +d.meta_score),
        d => d.genre
    ).map(([key, value]) => ({ genre: key, averageMetaScore: value }));

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(dataByGenre.map(d => d.genre))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([86, d3.max(dataByGenre, d => d.averageMetaScore)])
        .nice()
        .range([height, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g").call(yAxis);

    svg.selectAll(".bar")
        .data(dataByGenre)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.genre))
        .attr("y", d => yScale(d.averageMetaScore))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.averageMetaScore))
        .attr("fill", "steelblue");
});
