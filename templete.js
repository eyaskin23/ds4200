// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // 1. Convert string values to numbers for numeric fields only
    data.forEach(function(d) {
        d.SepalLength = +d.SepalLength;
        d.SepalWidth = +d.SepalWidth;
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // 2. Define the dimensions and margins for the SVG and create the SVG canvas
    const margin = { top: 20, right: 150, bottom: 50, left: 50},
          width = 500 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 3. Set up scales for x and y axes
    const xScale = d3.scaleLinear() 
        .domain([d3.min(data, d => d.PetalLength) - 1, d3.max(data, d => d.PetalLength) + 1])
        .range([0, width]);

    const yScale = d3.scaleLinear() 
        .domain([d3.min(data, d => d.PetalWidth) - 0.5, d3.max(data, d => d.PetalWidth) + 0.5])
        .range([height, 0]);

    // Color scale for species
    const colorScale = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.Species))]) // Unique species
        .range(d3.schemeCategory10);

    // 5. Add scales to the plot (axes)
    // Add x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // 6. Add circles for each data point
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalWidth))
        .attr("r", 5)
        .style("fill", d => colorScale(d.Species));

    // 7. Add x-axis and y-axis labels
    // X-axis label
    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 10) + ")")
        .style("text-anchor", "middle")
        .text("Petal Length");

    // Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Petal Width");

    // 8. Add legend
    // Create a group for each legend entry
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(" + (width + 10) + "," + (i * 25) + ")");

    // Add circles to the legend
    legend.append("circle")
        .attr("cx", 9)
        .attr("cy", 9)
        .attr("r", 6)
        .style("fill", colorScale);
    
    // Add text to the legend
    legend.append("text")
        .attr("x", 24)
        .attr("y", 14)
        .style("text-anchor", "start")
        .text(d => d);
});