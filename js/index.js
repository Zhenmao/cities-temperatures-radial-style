/* jshint esversion: 6 */

///////////////////////////////////////////////////////////////////////////////
//// Initial Set Up ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Global variables
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

const pie = d3.pie()
		.value(1); // Every slice is the same size, any constant will do

const zoom = d3.zoom()
	.on("zoom", zoomed);

///////////////////////////////////////////////////////////////////////////////
// Scales
const x = d3.scaleLinear()
		.domain([1, 366])
		.range([0, 2 * Math.PI]);

const y = d3.scaleLinear()
		.domain([0, 120])
		.range([innerRadius, outerRadius]);

// Color scale for y circles
const color = d3.scaleOrdinal()
		.domain(y.ticks(7))
		.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

// Color scale for tooltip text
const colorTooltip = d3.scaleQuantize()
		.domain([0, 120])
		.range(["#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

// Scale for pie slice of daily detail mouseover
const xBand = d3.scaleBand()
		.domain(d3.range(1, 367))
		.range([0, 2 * Math.PI])
		.align(0);

///////////////////////////////////////////////////////////////////////////////
// SVG containers

const svg = d3.select("#svg")
	.append("svg")
		.attr("width", width)
		.attr("height", height);

// Background rect to collect pointer events
svg.append("rect")
		.attr("class", "background")
		.attr("width", width)
		.attr("height", height)
		.attr("fill", "none")
		.style("pointer-events", "all")
		.on("click", reset);

// Container for zoomable elements
const zoomG = svg.append("g")
		.attr("class", "zoom");

// Tooltip
const tooltip = d3.select("#tooltip")
		.style("position", "absolute")
		.style("pointer-events", "none");

///////////////////////////////////////////////////////////////////////////////
//// Central Title ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

const titleG = svg.append("g")
		.attr("id", "title")
		.attr("transform", `translate(${width / 2}, ${height / 2})`)
		.attr("text-anchor", "middle");

titleG.append("text")
		.text("CityTemp Showdown")
		.attr("class", "main-title");

titleG.append("text")
		.attr("transform", "translate(0, 60)")
		.attr("class", "subtitle")
		.text("Which of the most populous US cities offers the best living climate?");

titleG.append("text")
		.attr("transform", "translate(0, 80)")
		.attr("class", "subtitle")
		.text("Click any city for daily maximum and minimum temperatures breakdown!");

///////////////////////////////////////////////////////////////////////////////
//// Load and Process Data ////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

d3.json("data/data.json", (error, data) => {
	if (error) throw error;

	// Combine json data with cityCenters
	cityCenters.forEach(cityCenter => {
		cityCenter.temperatures = data[cityCenter.name];
	});

	const citiesG = zoomG.append("g")
		.attr("id", "cities")
	.selectAll(".city")
	.data(cityCenters)
	.enter()
	.append("g")
		.attr("class", "city")
		.attr("id", d => d.name)
		.each(radialChart);

	/////////////////////////////////////////////////////////////////////////////
	//// Draw City Radial Chart /////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////

	function radialChart(data) {

		const g = d3.select(this)
				.attr("transform", `translate(${data.x}, ${data.y})`);

		/////////////////////////////////////////////////////////////////////////////
		// Colored circles and y labels
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

		// Axis labels visible only when zoomed in
		yTick.append("text")
				.attr("class", "y-label")
				.attr("y", d => -y(d))
				.attr("dy", "0.35em")
				.attr("fill", "none")
				.attr("stroke", "#fff")
				.attr("stroke-width", 1)
				.attr("stroke-linejoin", "round")
				.attr("font-size", "0.35em")
				.text(d => d + "℉")
				.style("display", "none");
		yTick.append("text")
				.attr("class", "y-label")
				.attr("y", d => -y(d))
				.attr("dy", "0.35em")
				.attr("font-size", "0.35em")
				.text(d => d + "℉")
				.style("display", "none");

		///////////////////////////////////////////////////////////////////////////
		// City name
		g.append("text")
				.attr("class", "city-name")
				.attr("text-anchor", "middle")
				.attr("fill", "#fff")
				.style("font-size", "1em")
				.attr("dy", "0.35em")
				.text(data.display);

		///////////////////////////////////////////////////////////////////////////
		// Minimum temperature line
		g.append("path")
				.datum(data.temperatures)
				.attr("fill", "none")
				.attr("stroke", "#fff")
				.attr("stroke-width", 1)
				.attr("d", d3.lineRadial()
						.angle(d => x(d.day))
						.radius(d => y(d.min)));
		// Maximum temperature line
		g.append("path")
				.datum(data.temperatures)
				.attr("fill", "none")
				.attr("stroke", "#fff")
				.attr("stroke-width", 1)
				.attr("d", d3.lineRadial()
						.angle(d => x(d.day))
						.radius(d => y(d.max)));

		///////////////////////////////////////////////////////////////////////////
		// Pie slice to capture mouseover tooltip
		const arcG = g.append("g")
			.selectAll(".arc")
			.data(pie(data.temperatures))
			.enter()
			.append("g")
				.attr("class", "arc");

		arcG.append("path")
				.attr("d", d3.arc()
						.innerRadius(innerRadius)
						.outerRadius(outerRadius))
						.attr("fill", "none")
						.style("pointer-events", "all")
						.on("mouseover", showTooltip)
						.on("mousemove", moveTooltip)
						.on("mouseout", hideTooltip);

		// Disk to capture click event to zoom in
		g.append("circle")
			.attr("class", "city-click")
			.attr("r", outerRadius)
			.attr("fill", "none")
			.style("pointer-events", "all")
			.on("click", clicked);

	}
});

///////////////////////////////////////////////////////////////////////////////
//// Event Listeners //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// Zoom
function zoomed() {
	zoomG.attr("transform", d3.event.transform);
}

///////////////////////////////////////////////////////////////////////////////
// When click a city, zoom to that city
function clicked(d) {
	const scale = height / citySideLength,
				translate = [width / 2 - scale * d.x, height / 2 - scale * d.y];

	// Hide titles
	d3.select("#title")
			.style("display", "none");

	zoomG.transition()
			.duration(750)
			.call(zoom.transform,
						d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
			.on("end", () => {
				// Disable city-click zoom by hidding those disks
				d3.selectAll(".city-click")
						.style("display", "none");

				// Show ylabels when zoomed in
				d3.selectAll(".y-label")
						.style("display", "");
			});
}

///////////////////////////////////////////////////////////////////////////////
// Reset zoom when click background
function reset() {
	// Hide ylabels when zoomed out
	d3.selectAll(".y-label")
			.style("display", "none");

	// Enable city-click zoom by showing those disks
	d3.selectAll(".city-click")
			.style("display", "");

	zoomG.transition()
			.duration(750)
			.call(zoom.transform,
						d3.zoomIdentity)
			.on("end", () => {
				// Show titles
				d3.select("#title")
						.style("display", "");
			});
}

///////////////////////////////////////////////////////////////////////////////
// Tooltip of daily temperature details
function showTooltip(d) {
	tooltip.transition()
			.style("opacity", 1);
	moveTooltip(d);

	// Also highlight the day arc
	d3.select(this)
		.transition()
			.attr("fill", "rgba(255, 255, 255, 0.5)");
}

function moveTooltip(d) {
	tooltip.style("left", d3.event.pageX + 10 + "px")
			.style("top", d3.event.pageY + 10 + "px")
			.html(`
				<span class="tooltip-key">Date </span><span class="tooltip-value">${dayNumber2Date(d.data.day)}</span><br>
				<span class="tooltip-key">Maximum </span><span class="tooltip-value" id="tooltip-max">${d.data.max}℉</span><br>
				<span class="tooltip-key">Average </span><span class="tooltip-value" id="tooltip-avg">${d.data.avg}℉</span><br>
				<span class="tooltip-key">Minimum </span><span class="tooltip-value" id="tooltip-min">${d.data.min}℉</span><br>
			`);
	d3.select("#tooltip-max").style("color", colorTooltip(d.data.max));
	d3.select("#tooltip-avg").style("color", colorTooltip(d.data.avg));
	d3.select("#tooltip-min").style("color", colorTooltip(d.data.min));
}

function hideTooltip() {
	tooltip.transition()
			.style("opacity", 0);

	// Also highlight the day arc
	d3.select(this)
		.transition()
			.attr("fill", "none");
}

///////////////////////////////////////////////////////////////////////////////
//// Helper Functions /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function dayNumber2Date(dayNum) {
	// Given the number of day 1-366
	// Return the month and day
	const daysArray = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	const daysAccumulatedArray = [];
	daysArray.reduce((prev, curr, index) => {
		return (daysAccumulatedArray[index] = prev + curr);
	}, 0);
	// Binary search to find the insert position, which is zero index based month
	const monthNum = searchInsert(daysAccumulatedArray, dayNum);
	let month = "";
	switch(monthNum) {
		case 0:
			month = "Jan";
			break;
		case 1:
			month = "Feb";
			break;
		case 2:
			month = "Mar";
			break;
		case 3:
			month = "Apr";
			break;
		case 4:
			month = "May";
			break;
		case 5:
			month = "Jun";
			break;
		case 6:
			month = "Jul";
			break;
		case 7:
			month = "Aug";
			break;
		case 8:
			month = "Sep";
			break;
		case 9:
			month = "Oct";
			break;
		case 10:
			month = "Nov";
			break;
		case 11:
			month = "Dec";
			break;
	}
	const day = monthNum === 0 ? dayNum  : dayNum - daysAccumulatedArray[monthNum - 1];
	return month + ", " + day;
}
