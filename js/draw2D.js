const svg = d3.select("svg");

var margin = { top: 20, right: 20, bottom: 40, left: 60 };
var width = window.innerWidth - margin.left - margin.right;
var height = +svg.attr("height") - margin.top - margin.bottom;

let minX, maxX, minY, maxY;

const g = d3.select("#TwoDimension");
let xScale, yScale;
let xAxis, yAxis;
let gX, gY;

export function draw2DPoints(selectedSection) {
    g.selectAll("*").remove(); //remove old elements

    //get all vertexs of points2D in current section
    let allVertex = selectedSection.polygons.flatMap(p => p.points2D);

    //find min and max value to create axis
    minX = Math.floor(d3.min(allVertex.map(v => v.vertex[0])) / 100) * 100;
    maxX = Math.ceil(d3.max(allVertex.map(v => v.vertex[0])) / 100) * 100;
    xScale = d3.scaleLinear()
        .domain([minX, maxX])
        .range([margin.left, width]);
    xAxis = d3.axisBottom(xScale);

    minY = Math.floor(d3.min(allVertex.map(v => v.vertex[1])) / 100) * 100;
    maxY = Math.ceil(d3.max(allVertex.map(v => v.vertex[1])) / 100) * 100;
    yScale = d3.scaleLinear()
        .domain([minY, maxY])
        .range([height, 0]);
    yAxis = d3.axisLeft(yScale);

    //draw grid
    drawGrid(xScale, yScale);

    //append polygons to svg
    selectedSection.polygons.forEach(polygon => {
        const points = polygon.points2D.map(v => [xScale(v.vertex[0]), yScale(v.vertex[1])].join(",")).join(" ");
        g.append("polygon")
            .attr("points", points)
            .style("fill", "#" + polygon.color)
            .style("stroke", "black")
            .on("click", function (event) {
                d3.selectAll(".polygon").classed("selected", false);
                if (!d3.select(this).classed("selected")) {
                    d3.select(this).classed("selected", true);
                } else {
                    d3.select(this).classed("selected", false);
                }

                event.stopPropagation();
            });
    });

    //append axis to svg and add lable
    gX = g.append("g").attr("class", "axis x-axis")
        .attr("transform", `translate(0, ${height})`).call(xAxis);
    gY = g.append("g").attr("class", "axis y-axis")
        .attr("transform", `translate(${margin.left}, 0)`).call(yAxis);
    addLabel();

    // Add zoom and pan
    const zoom = d3.zoom()
        .scaleExtent([1, 40])
        .translateExtent([[-100, -100], [width + 90, height + 100]])
        .filter(filter)
        .on("zoom", (event) => {
            let zoomTransform = event.transform;
            d3.selectAll("polygon").attr("transform", zoomTransform);
            //rescale axis and grid
            gX.call(xAxis.scale(zoomTransform.rescaleX(xScale)));
            gY.call(yAxis.scale(zoomTransform.rescaleY(yScale)));
            drawGrid(zoomTransform.rescaleX(xScale), zoomTransform.rescaleY(yScale));
        });

    svg.call(zoom);
}

function filter(event) {
    event.preventDefault();
    return (!event.ctrlKey || event.type === 'wheel') && !event.button;
}

function drawGrid(xScale, yScale) {
    g.select(".grid").remove(); // Remove old grid

    const gridGroup = g.insert("g", ":first-child").attr("class", "grid");

    // grid for x axis
    const xTicks = xScale.ticks();
    gridGroup.selectAll(".grid-x")
        .data(xTicks)
        .enter().append("line")
        .attr("class", "grid-x")
        .attr("x1", d => xScale(d))
        .attr("y1", 0)
        .attr("x2", d => xScale(d))
        .attr("y2", height)
        .attr("stroke", "lightgray")
        .attr("stroke-dasharray", "4");

    // grid for y axis
    const yTicks = yScale.ticks();
    gridGroup.selectAll(".grid-y")
        .data(yTicks)
        .enter().append("line")
        .attr("class", "grid-y")
        .attr("x1", margin.left)
        .attr("y1", d => yScale(d))
        .attr("x2", width)
        .attr("y2", d => yScale(d))
        .attr("stroke", "lightgray")
        .attr("stroke-dasharray", "4");
}

function addLabel() {
    // Add X axis label:
    g.append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 20)
        .text("X");

    // Y axis label:
    g.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left / 2)
        .attr("x", -height / 2)
        .text("Y")
}