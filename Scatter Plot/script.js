const width = 1200;
const height = 500;
const margin = { top: 20, right: 30, bottom: 30, left: 40 };

d3.csv("../visualizer_preprocess.csv").then((dataset) => {
    createCheckboxes(dataset);
    showScatterPlot(dataset);
});

function createCheckboxes(data) {
    const platforms = Array.from(new Set(data.map(d => d.platform)));
    const checkboxContainer = d3.select("#checkboxes");

    checkboxContainer.selectAll("label")
        .data(platforms)
        .enter()
        .append("label")
        .text(d => d)
        .append("input")
        .attr("type", "checkbox")
        .attr("value", d => d)
        .attr("checked", true)
        .on("change", function() {
            const selectedPlatforms = [];
            checkboxContainer.selectAll("input").each(function(d) {
                if (d3.select(this).property("checked")) {
                    selectedPlatforms.push(d);
                }
            });
            updateScatterPlot(data, selectedPlatforms);
        });
}

function showScatterPlot(data) {
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

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data.map(d => d.genre));

    const xAxis = d3.axisBottom().scale(xScale);
    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    const yAxis = d3.axisLeft().scale(yScale);
    const yAxisGroup = svg.append("g").call(yAxis);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("z-index", "10")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("pointer-events", "none");

    const circles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(+d.user_review))
        .attr("cy", (d) => yScale(+d.meta_score))
        .attr("r", 4)
        .attr("fill", (d) => colorScale(d.genre))
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Name: ${d.name}<br/>Platform: ${d.platform}<br/>Release Date: ${d.release_date}<br/>Genre: ${d.genre}<br/>Meta Score: ${d.meta_score}<br/>User Review: ${d.user_review}`)
                .style("left", (event.clientX + 10) + "px")
                .style("top", (event.clientY - 25) + "px");
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.clientX + 10) + "px")
                   .style("top", (event.clientY - 25) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    const avgUserReview = d3.mean(data, d => +d.user_review);
    const avgMetaScore = d3.mean(data, d => +d.meta_score);

    svg.append("line")
        .attr("x1", xScale(avgUserReview))
        .attr("x2", xScale(avgUserReview))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "grey")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4");

    svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(avgMetaScore))
        .attr("y2", yScale(avgMetaScore))
        .attr("stroke", "grey")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4");

    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        .on("click", function(event, genre) {
            const circles = svg.selectAll("circle");
            if (activeGenre === genre) {
                circles.style("opacity", 1);
                activeGenre = null;
            } else {
                circles.style("opacity", d => d.genre === genre ? 1 : 0.1);
                activeGenre = genre;
            }
        });

    legend.append("rect")
        .attr("x", width + 20)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", width + 45)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d);

    const brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("end", brushended);

    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    d3.select("body").append("button")
        .text("Reset Zoom")
        .on("click", resetZoom);

    function brushended(event) {
        if (!event.selection) return;

        const [[x0, y0], [x1, y1]] = event.selection;
        const selectedData = data.filter(d => {
            const x = xScale(+d.user_review);
            const y = yScale(+d.meta_score);
            return x0 <= x && x <= x1 && y0 <= y && y <= y1;
        });

        xScale.domain([x0, x1].map(xScale.invert, xScale));
        yScale.domain([y1, y0].map(yScale.invert, yScale));

        svg.select(".brush").call(brush.move, null);

        zoom(selectedData);
    }

    function zoom(selectedData) {
        const t = svg.transition().duration(750);
        svg.select(".x.axis").transition(t).call(xAxis);
        svg.select(".y.axis").transition(t).call(yAxis);

        svg.selectAll("circle").transition(t)
            .attr("cx", (d) => xScale(+d.user_review))
            .attr("cy", (d) => yScale(+d.meta_score))
            .attr("r", d => selectedData.includes(d) ? 4 : 0)
            .on("end", attachTooltip);
    }

    function resetZoom() {
        xScale.domain([3, d3.max(data, (d) => +d.user_review)]);
        yScale.domain([84, d3.max(data, (d) => +d.meta_score)]);

        const t = svg.transition().duration(750);
        svg.select(".x.axis").transition(t).call(xAxis);
        svg.select(".y.axis").transition(t).call(yAxis);

        svg.selectAll("circle").transition(t)
            .attr("cx", (d) => xScale(+d.user_review))
            .attr("cy", (d) => yScale(+d.meta_score))
            .attr("r", 4)
            .on("end", attachTooltip);
    }

    function attachTooltip() {
        svg.selectAll("circle")
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Name: ${d.name}<br/>Platform: ${d.platform}<br/>Release Date: ${d.release_date}<br/>Genre: ${d.genre}<br/>Meta Score: ${d.meta_score}<br/>User Review: ${d.user_review}`)
                    .style("left", (event.clientX + 10) + "px")
                    .style("top", (event.clientY - 25) + "px");
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.clientX + 10) + "px")
                .style("top", (event.clientY - 25) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }

    attachTooltip();
}

function updateScatterPlot(data, selectedPlatforms) {
    const filteredData = data.filter(d => selectedPlatforms.includes(d.platform));

    const svg = d3.select("#chart svg g");

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data.map(d => d.genre));

    const xScale = d3.scaleLinear()
        .domain([3, d3.max(data, (d) => +d.user_review)])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([84, d3.max(data, (d) => +d.meta_score)])
        .range([height, 0]);

    const circles = svg.selectAll("circle")
        .data(filteredData, d => d.name);

    circles.exit().remove();

    circles.enter()
        .append("circle")
        .attr("cx", (d) => xScale(+d.user_review))
        .attr("cy", (d) => yScale(+d.meta_score))
        .attr("r", 4)
        .attr("fill", (d) => colorScale(d.genre))
        .merge(circles)
        .attr("cx", (d) => xScale(+d.user_review))
        .attr("cy", (d) => yScale(+d.meta_score))
        .attr("r", 4)
        .attr("fill", (d) => colorScale(d.genre));

    attachTooltip();
}

function attachTooltip() {
    const tooltip = d3.select(".tooltip");

    d3.selectAll("circle")
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Name: ${d.name}<br/>Platform: ${d.platform}<br/>Release Date: ${d.release_date}<br/>Genre: ${d.genre}<br/>Meta Score: ${d.meta_score}<br/>User Review: ${d.user_review}`)
                .style("left", (event.clientX + 10) + "px")
                .style("top", (event.clientY - 25) + "px");
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.clientX + 10) + "px")
                   .style("top", (event.clientY - 25) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}
