/* jshint esversion: 6 */
const width = 960,
			height = 960;

const svg = d3.select("#svg")
	.append("svg")
		.attr("width", width)
		.attr("height", height);

const innerRadius = 180,
			outerRadius = Math.min(width, height) / 2;

const g = svg.append("g")
		.attr("transform", `translate(${width / 2}, ${height / 2})`);

const x = d3.scaleLinear()
		.domain([1, 366])
		.range([0, 2 * Math.PI]);

const y = d3.scaleLinear()
		.domain([0, 120])
		.range([innerRadius, outerRadius]);

const xMinMax = d3.scaleBand()
		.range([0, 2 * Math.PI])
		.align(0);

// const yMinMax = d3.scaleRadial()
// 		.domain([0, 110])
// 		.range([innerRadius, outerRadius]);

const color = d3.scaleOrdinal()
		.domain(y.ticks(7))
		.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

d3.json("data/data.json", processData);

function processData(error, data) {
	if (error) throw error;
	data = data.chicago;
	radialChart(data);
}

function radialChart(data) {
	xMinMax.domain(data.map(d => d.day));

	// Minimum and Maximum temperature band
	// g.append("g")
	// 	.selectAll("g")
	// 	.data(d3.stack()
	// 			.keys(["min", "max"])
	// 			(data))
	// 	.enter()
	// 	.append("g")
	// 		.attr("fill", d => color(d.key))
	// 	.selectAll("path")
	// 	.data(d => d)
	// 	.enter()
	// 	.append("path")
	// 		.attr("d", d3.arc()
	// 				.innerRadius(d => y(d[0]))
	// 				.outerRadius(d => y(d[1] - d[0]))
	// 				.startAngle(d => xMinMax(d.data.day))
	// 				.endAngle(d => xMinMax(d.data.day) + xMinMax.bandwidth()));

	const yAxis = g.append("g")
			.attr("text-anchor", "middle");

	const yTick = yAxis
		.selectAll("g")
		.data(y.ticks(7).reverse())
		.enter()
		.append("g");

	yTick.append("circle")
			.attr("fill", d => color(d))
			.attr("stroke", "none")
			.attr("r", y);

	yTick.append("text")
			.attr("y", d => -y(d))
			.attr("dy", "0.35em")
			.attr("fill", "none")
			.attr("stroke", "#fff")
			.attr("stroke-width", 5)
			.attr("stroke-linejoin", "round")
			.text(d => d + "℉");

	yTick.append("text")
			.attr("y", d => -y(d))
			.attr("dy", "0.35em")
			.text(d => d + "℉");

	// City name
	g.append("text")
			.attr("text-anchor", "middle")
			.attr("fill", "#fff")
			.style("font-size", "3em")
			.attr("dy", "0.35em")
			.text("Chicago");

	// Average temperature line
	// g.append("g")
	// 	.append("path")
	// 		.datum(data)
	// 		.attr("fill", "none")
	// 		.attr("stroke", "#fff")
	// 		.attr("stroke-width", 4)
	// 		.attr("d", d3.lineRadial()
	// 				.angle(d => x(d.day))
	// 				.radius(d => y(d.avg)));

	g.append("g")
		.append("path")
			.datum(data)
			.attr("fill", "none")
			.attr("stroke", "#fff")
			.attr("stroke-width", 4)
			.attr("d", d3.lineRadial()
					.angle(d => x(d.day))
					.radius(d => y(d.min)));

	g.append("g")
		.append("path")
			.datum(data)
			.attr("fill", "none")
			.attr("stroke", "#fff")
			.attr("stroke-width", 4)
			.attr("d", d3.lineRadial()
					.angle(d => x(d.day))
					.radius(d => y(d.max)));

}

