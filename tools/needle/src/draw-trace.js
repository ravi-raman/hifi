function MetricsChart(g, metMap) {
    //First prepare a a list of dictionaries
    //Each dictionary will store function name, avg duration, avg start time, avg end time
    var data = [];
    for (met in metMap) {
        var dict = {}
        dict["function_name"] = metMap[met].getName();
        dict["avgDuration"] = metMap[met].getAverage();
        dict["avgStartTime"] = metMap[met].getAverageStartTime();
        dict["avgEndTime"] = metMap[met].getAverageStartTime() + metMap[met].getAverage();
        data.push(dict);
    }
    
    // Sort in ascending order of average start time
    // This is done to ensure that functions and sub-functions are grouped properly
    data.sort(function(func1, func2) {
        return func2.avgStartTime - func1.avgStartTime;
    });

    // Tool tip
    var tooltip = d3.select("body").append("div").attr("class", "toolTip");

    // create scale objects
    var yAxisScale = d3.scaleBand()
        .domain(data.map(function(d) {
            return d.function_name;
        }))
        .range([height, 0])
        .round(true,false);
    var xAxisScale = d3.scaleLinear()
        .domain([
            d3.min(data, function(d) {
                return (d.avgStartTime);
            }),
            d3.max(data, function(d) {
                return (d.avgEndTime);
            })
        ])
        .range([0, width]);

    // create axis objects
    var xAxis = d3.axisTop(xAxisScale).ticks(7);
    var yAxis = d3.axisLeft(yAxisScale);

    // Zoom Function
    var zoom = d3.zoom()
        .on("zoom", zoomFunction);
    d3.select("button").on("click", resetview);

    var graphContainer = g.attr("transform", 'translate(250,50)')
        .attr("class", "graphContainer")

    // append zoom area
    var view = graphContainer.append("rect")
        .attr("id", "zoom")
        .attr("class", "zoom")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

    //add end clip area
    var clipPath = graphContainer.append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height);

    // plot tracing data.
    // defined colors for bar graph. Different colors picked in random from predefined d3 colors.
    var color = d3.scaleOrdinal(d3.schemeCategory20);

    //set clip-path to clip overflow data from graph
    var traceData = g.append('g')
        .attr("class", "traceData")
        .attr('clip-path', 'url(#clip)');

    //Tool tip on hovering the mouse over each bar
    //The tool tip will show the average values (average start time, average end time and average duration)
    traceData = traceData.selectAll("g")
        .data(data)
        .enter()
        .append("g").attr('class', 'barWrap')
        .on("mousemove", function(d) {
            trace_tooltip('show', tooltip, d3.event, d);
        })
        .on("mouseout", function(d) {
            trace_tooltip('hide', tooltip);
        });

    //Bars showing average durations for each function
    //The starting point of each bar will be the average start time of the function
    //The end point of each bar will be the average end time of the function
    traceData
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {
            return xAxisScale(d.avgStartTime);
        })
        .attr("y", function(d) {
            return yAxisScale(d.function_name);
        })
        .attr("height", yAxisScale.bandwidth())
        .attr("width", function(d) {
			 return xAxisScale(d.avgEndTime) - xAxisScale(d.avgStartTime);
        })
        .attr("fill", function(d, i) {
            return color(i)
        })

    //The function name to be displayed on each graph
    traceData
        .append("text")
        .attr("x", function(d) {
            return xAxisScale(d.avgStartTime);
        })
        .attr("y", function(d) {
            return (yAxisScale(d.function_name) + (yAxisScale.bandwidth() / 2))
        })
        .attr("dy", ".36em")
        .attr("text-anchor", "start")
        .attr('class', 'score')
        .text(function(d) {
            return d.function_name;
        });

    // Draw Axis
    var gX = graphContainer.append("g").call(xAxis);
    var gY = graphContainer.append("g").call(yAxis);

    // Add axis labels for X-axis and Y-axis
    // text label for the X axis
    g.append("text")
        .attr("y", 0)
        .attr("x", (width / 2))
        .attr("dy", "-40px")
        .style("text-anchor", "middle")
        .text("Average time in ms");

    // text label for the Y axis
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "40px")
        .style("text-anchor", "middle")
        .text("Function Name");

    // Called during zoom-in and zoom-out
    function zoomFunction() {
        // update axes as per zoom-in or zoom-out
        gX.call(xAxis.scale(d3.event.transform.rescaleX(xAxisScale)));
        var t = d3.event.transform,
            xt = t.rescaleX(xAxisScale);
        // update graph
        traceData.selectAll('.score')
            .attr("x", function(d) {
                return xt(d.avgStartTime);
            })
        traceData.selectAll('.bar')
            .attr("x", function(d) {
                return xt(d.avgStartTime);
            })
            .attr("width", function(d) {
                return xt(d.avgEndTime) - xt(d.avgStartTime);
            })
    };
    
    // Reset view. Called on clicking the Reset button
    function resetview() {
        d3.select("#zoom").transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
    }
}

// Function for showing tool tip with the average values for each function in the horizontal bar
function trace_tooltip(state, obj, event, d) {
    if (state == 'show') {
        obj
            .style("left", event.pageX - 50 + "px")
            .style("top", event.pageY - 70 + "px")
            .style("display", "inline-block")
            .html("<b>" + (d.function_name) + "</b><br><b>Avg Duration : </b>" + (d.avgDuration) + " ms" + "<br><b>Avg Start Time : </b>" + (d.avgStartTime) + " ms" + "<br><b>Avg End Time : </b>" + (d.avgDuration + d.avgStartTime) + " ms");
    } else {
        obj.style("display", "none")
            .text(String);
    }
}
