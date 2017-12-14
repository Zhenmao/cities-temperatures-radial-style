/* jshint esversion: 6 */
const width = 960,
			height = 720;

const citySideLength = 960 / 4,
			cityMargin = 10;

const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
										 "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"];

// Clockwide layout for cities
const citiesLayout = [
	{ x: 0.5, y: 0.5},
	{ x: 1.5, y: 0.5},
	{ x: 2.5, y: 0.5},
	{ x: 3.5, y: 0.5},
	{ x: 3.5, y: 1.5},
	{ x: 3.5, y: 2.5},
	{ x: 2.5, y: 2.5},
	{ x: 1.5, y: 2.5},
	{ x: 0.5, y: 2.5},
	{ x: 0.5, y: 1.5},
];

const cityCenters = cities.map((d, i) => ({
		name: d.toLowerCase().replace(" ", "_"),
		display: d,
		x: citiesLayout[i].x * citySideLength,
		y: citiesLayout[i].y * citySideLength
	}));

const innerRadius = 32,
			outerRadius = citySideLength / 2 - cityMargin;

const x = d3.scaleLinear()
		.domain([1, 366])
		.range([0, 2 * Math.PI]);

const y = d3.scaleLinear()
		.domain([0, 120])
		.range([innerRadius, outerRadius]);

const xMinMax = d3.scaleBand()
		// .domain(data.map(d => d.day))
		.range([0, 2 * Math.PI])
		.align(0);

// const yMinMax = d3.scaleRadial()
// 		.domain([0, 110])
// 		.range([innerRadius, outerRadius]);

const color = d3.scaleOrdinal()
		.domain(y.ticks(7))
		.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

const svg = d3.select("#svg")
	.append("svg")
		.attr("width", width)
		.attr("height", height);

d3.json("data/data.json", (error, data) => {
	if (error) throw error;

	// Combine json data with cityCenters
	cityCenters.forEach(cityCenter => {
		cityCenter.temperatures = data[cityCenter.name];
	});

	const citiesG = svg.append("g")
		.attr("id", "cities")
	.selectAll(".city")
	.data(cityCenters)
	.enter()
	.append("g")
		.attr("class", "city")
		.attr("id", d => d.name)
		.each(radialChart);

	function radialChart(data) {

		const g = d3.select(this)
				.attr("transform", `translate(${data.x}, ${data.y})`);

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

		// Axis labels
		// yTick.append("text")
		// 		.attr("y", d => -y(d))
		// 		.attr("dy", "0.35em")
		// 		.attr("fill", "none")
		// 		.attr("stroke", "#fff")
		// 		.attr("stroke-width", 3)
		// 		.attr("stroke-linejoin", "round")
		// 		.attr("font-size", "0.75em")
		// 		.text(d => d + "℉");

		// yTick.append("text")
		// 		.attr("y", d => -y(d))
		// 		.attr("dy", "0.35em")
		// 		.attr("font-size", "0.75em")
		// 		.text(d => d + "℉");

		// City name
		g.append("text")
				.attr("text-anchor", "middle")
				.attr("fill", "#fff")
				.style("font-size", "1em")
				.attr("dy", "0.35em")
				.text(data.display);

		// Average temperature line
		// g.append("g")
		// 	.append("path")
		// 		.datum(data.temperatures)
		// 		.attr("fill", "none")
		// 		.attr("stroke", "#fff")
		// 		.attr("stroke-width", 4)
		// 		.attr("d", d3.lineRadial()
		// 				.angle(d => x(d.day))
		// 				.radius(d => y(d.avg)));

		g.append("g")
			.append("path")
				.datum(data.temperatures)
				.attr("fill", "none")
				.attr("stroke", "#fff")
				.attr("stroke-width", 2)
				.attr("d", d3.lineRadial()
						.angle(d => x(d.day))
						.radius(d => y(d.min)));

		g.append("g")
			.append("path")
				.datum(data.temperatures)
				.attr("fill", "none")
				.attr("stroke", "#fff")
				.attr("stroke-width", 2)
				.attr("d", d3.lineRadial()
						.angle(d => x(d.day))
						.radius(d => y(d.max)));

	}




});
