// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
        d.SepalLength = +d.SepalLength;
        d.SepalWidth = +d.SepalWidth;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 20, right: 30, bottom: 40, left: 40},
        width = 500 - margin.left - margin.right;
        height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("body").append("Svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // Set up scales for x and y axes
    // d3.min(data, d => d.bill_length_mm)-5

    const xScale = d3.scaleLinear() 
        .domain([d3.min(data, d => d.PetalLength) - 1, d3.max(data, d => d.PetalLength) + 1])
        .range([0, width]);

    // Add scales     

    const yScale = d3.scaleLinear() 
        .domain([d3.min(data, d => d.PetalWidth) - 1, d3.max(data, d => d.PetalWidth) + 1])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);
    

    // Add circles for each data point
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalLength))
        .attr("r", 5)
        .style("fill", d => colorScale(d.Species))

    
    // Add x-axis label
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", width)
        .attr("y", -10)
        .style("text-anchor", "end")
        .text("Petal Length");
    

    // Add y-axis label
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("x", 6)
        .attr("y", 6)
        .style("text-anchor", "start")
        .text("Petal Width");
    

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect")
        .attr("x", width + 10)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale);
    
    legend.append("text")
        .attr("x", width + 34)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d);

});
