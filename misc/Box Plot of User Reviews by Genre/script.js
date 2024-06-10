const width = 1400;
const height = 500;
const margin = { top: 20, right: 30, bottom: 40, left: 50 };

d3.csv("../visualizer_preprocess.csv").then((dataset) => {
    const dataByGenre = d3.groups(dataset, d => d.genre);

    const genres = dataByGenre.map(d => d[0]);
    const userReviewsByGenre = dataByGenre.map(d => d[1].map(g => +g.user_review));

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(genres)
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([d3.min(userReviewsByGenre, arr => d3.min(arr)), d3.max(userReviewsByGenre, arr => d3.max(arr))])
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

    const boxWidth = xScale.bandwidth() * 0.8;

    userReviewsByGenre.forEach((values, i) => {
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const interQuantileRange = q3 - q1;
        const min = q1 - 1.5 * interQuantileRange;
        const max = q3 + 1.5 * interQuantileRange;

        svg.append("line")
            .attr("x1", xScale(genres[i]) + boxWidth / 2)
            .attr("x2", xScale(genres[i]) + boxWidth / 2)
            .attr("y1", yScale(min))
            .attr("y2", yScale(max))
            .attr("stroke", "black");

        svg.append("rect")
            .attr("x", xScale(genres[i]) - boxWidth / 2)
            .attr("y", yScale(q3))
            .attr("height", yScale(q1) - yScale(q3))
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .attr("fill", "#69b3a2");

        svg.append("line")
            .attr("x1", xScale(genres[i]) - boxWidth / 2)
            .attr("x2", xScale(genres[i]) + boxWidth / 2)
            .attr("y1", yScale(median))
            .attr("y2", yScale(median))
            .attr("stroke", "black");

        svg.append("line")
            .attr("x1", xScale(genres[i]) - boxWidth / 2)
            .attr("x2", xScale(genres[i]) + boxWidth / 2)
            .attr("y1", yScale(min))
            .attr("y2", yScale(min))
            .attr("stroke", "black");

        svg.append("line")
            .attr("x1", xScale(genres[i]) - boxWidth / 2)
            .attr("x2", xScale(genres[i]) + boxWidth / 2)
            .attr("y1", yScale(max))
            .attr("y2", yScale(max))
            .attr("stroke", "black");

        const outliers = values.filter(v => v < min || v > max);
        svg.selectAll("circle.outlier")
            .data(outliers)
            .enter()
            .append("circle")
            .attr("class", "outlier")
            .attr("cx", xScale(genres[i]))
            .attr("cy", d => yScale(d))
            .attr("r", 3)
            .attr("fill", "red");
    });
});
