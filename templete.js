// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers for numeric fields only
    data.forEach(function(d) {
        d.SepalLength = +d.SepalLength;
        d.SepalWidth = +d.SepalWidth;
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 20, right: 150, bottom: 50, left: 50},
          scatterWidth = 500 - margin.left - margin.right,
          boxplotWidth = 300,
          height = 400 - margin.top - margin.bottom;

    // Create the SVG container for both plots
    const svg = d3.select("body").append("svg")
        .attr("width", scatterWidth + boxplotWidth + margin.left + margin.right + 100) 
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up scales for scatterplot
    const xScatterScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 1, d3.max(data, d => d.PetalLength) + 1])
        .range([0, scatterWidth]);

    const yScatterScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth) - 0.5, d3.max(data, d => d.PetalWidth) + 0.5])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.Species))])
        .range(d3.schemeCategory10);

    // Add scatterplot circles
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScatterScale(d.PetalLength))
        .attr("cy", d => yScatterScale(d.PetalWidth))
        .attr("r", 5)
        .style("fill", d => colorScale(d.Species));

    // Add scatterplot x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScatterScale))
        .append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", 35)
        .style("text-anchor", "middle")
        .text("Petal Length");

    // Add scatterplot y-axis
    svg.append("g")
        .call(d3.axisLeft(yScatterScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .style("text-anchor", "middle")
        .text("Petal Width");

    // Set up scales for boxplot (positioned to the right of scatterplot)
    const xBoxScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Species))])
        .range([scatterWidth + 50, scatterWidth + boxplotWidth + 50])
        .padding(0.4);

    const yBoxScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 1, d3.max(data, d => d.PetalLength) + 1])
        .range([height, 0]);

    // Add boxplot x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xBoxScale))
        .append("text")
        .attr("x", scatterWidth + boxplotWidth / 2 + 50)
        .attr("y", 35)
        .style("text-anchor", "middle")
        .text("Species");

    // Add boxplot y-axis
    svg.append("g")
        .attr("transform", "translate(" + (scatterWidth + 50) + ",0)")
        .call(d3.axisLeft(yBoxScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .style("text-anchor", "middle")
        .text("Petal Length");

    // Define the rollup function to calculate quartiles
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        const min = q1 - 1.5 * iqr;
        const max = q3 + 1.5 * iqr;
        return { q1, median, q3, iqr, min, max };
    };

    // Calculate quartiles for each species
    // This line of code defines the rollup for the species data. 
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    //Then this code iterator over each entry in the quartilesBySpecies Map, 
    //taking in two parameters, the quartiles of the boxplot, and
    //the species key for each entry. f.e. "iris-setosa"
    // for each species, the code interprets the x-coordinate where the box
    // for that species should be drawn, and then also the boxwidth 
    // for each species, ensuring spacing between them. 
    // Draw the boxplot for each species
    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xBoxScale(species);
        const boxWidth = xBoxScale.bandwidth();

        // Vertical line (whisker) from min to max
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yBoxScale(quartiles.min))
            .attr("y2", yBoxScale(quartiles.max))
            .attr("stroke", "black");

        // Box from q1 to q3
        svg.append("rect")
            .attr("x", x)
            .attr("y", yBoxScale(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yBoxScale(quartiles.q1) - yBoxScale(quartiles.q3))
            .attr("fill", "lightblue")
            .attr("stroke", "black");

        // Horizontal line for the median
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yBoxScale(quartiles.median))
            .attr("y2", yBoxScale(quartiles.median))
            .attr("stroke-width",2);
    });
});