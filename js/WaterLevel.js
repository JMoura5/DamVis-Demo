function initWaterLevel(containerID) {
    var container = document.getElementById(containerID);
    var margin = {top: 15, right: 40, bottom: 85, left: 60};
    var width = container.clientWidth - margin.left - margin.right;
    var height = container.clientHeight - margin.top - margin.bottom;
    var formatTime = d3.timeFormat("%d-%b-%Y %H:%M");
    var chart;
    var selectedDate;
    var lastZoom;

    initDateTimePicker();

    var svg = d3.select('#' + containerID)
        .append('svg')
        .attr('width', container.clientWidth)
        .attr('height', container.clientHeight)
        .append("g");

    var xScale = d3.scaleTime().range([0, width]);
    var xScale2 = d3.scaleTime().range([0, width]);
    var yScale = d3.scaleLinear().range([height, 0]);

    var xAxis = d3.axisBottom(xScale).ticks((width + 2) / (height + 2) * 5);
    var yAxis = d3.axisLeft(yScale);

    var zoom = d3.zoom()
        .scaleExtent([1, 20])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    var line = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.waterLevel); });

    var mask = svg.append("defs").append("clipPath")
        .attr("id", "mask")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = [];

    var tooltip = d3.select('#tooltip');
    var tooltipLine = svg.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", 0)
        .style("stroke-width", 2)
        .style("stroke", "steelblue")
        .style("fill", "none")
        .style("opacity", 0);

    var clickedLine;

    $.getJSON('../data/Cota.json', function(_data) {

        data = _data.map(function(d) {
            return {
                date: new Date(d.year, d.month, d.day, d.hour, d.minute),
                waterLevel: +d.waterLevel
            }
        });

        var xMin = d3.min(data, function(d) { return d.date; });
        var xMax = d3.max(data, function(d) { return d.date; });
        xScale.domain([xMin, xMax]);
        xScale2.domain(xScale.domain());

        var yMin = d3.min(data, function(d) { return d.waterLevel - 10; });
        var yMax = d3.max(data, function(d) { return d.waterLevel + 10; });
        yScale.domain([yMin, yMax]);

        var gXAxis = focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        gXAxis.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        var gYAxis = focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        focus.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Water Level (m)");

        focus.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .call(zoom)
            .on("wheel", function() { d3.event.preventDefault(); });

        d3.select(window)
            .on("keydown", keydown);

        var gFocus = focus.append("g").attr("clip-path", "url(#mask)");
        clickedLine = gFocus.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", 0)
            .style("stroke-width", 3)
            .style("stroke", "orange")
            .style("fill", "none")
            .style("opacity", 0);

        chart = gFocus.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 4)
            .attr("d", line);

        focus.on('mouseover', function() {
            var x0 = xScale.invert(d3.mouse(this)[0]);
            var i = d3.bisector(function(d) { return d.date; }).left(data, x0, 0);

            tooltip.html(formatTime(data[i].date) + "<br/>"  + data[i].waterLevel + " meters")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 50) + "px");

            tooltip.style("opacity", .9);

            tooltipLine
                .attr("x1", xScale(data[i].date) + margin.left)
                .attr("y1", yScale(data[i].waterLevel) + margin.top)
                .attr("x2", xScale(data[i].date) + margin.left)
                .attr("y2", height + margin.top)
                .style("opacity", .9);
            })
            .on('mouseout', function() {
                tooltip
                    .style("opacity", 0)
                    .style("left", "0px")
                    .style("top", "0px");

                tooltipLine.style("opacity", 0)
                    .style("left", "0px")
                    .style("top", "0px");
            })
            .on('click', function() {
                var x0 = xScale.invert(d3.mouse(this)[0]);
                var i = d3.bisector(function(d) { return d.date; }).left(data, x0, 1);
                selectedDate = data[i];

                selectTime(selectedDate.date, selectedDate.waterLevel, formatTime(selectedDate.date) + " - "  + selectedDate.waterLevel + " meters");
                clickedLine
                    .attr("x1", xScale(selectedDate.date))
                    .attr("y1", margin.top)
                    .attr("x2", xScale(selectedDate.date))
                    .attr("y2", height + margin.top)
                    .style("opacity", .9);
            });
    });

    function zoomed() {
        lastZoom = d3.event;
        var t = lastZoom.transform;
        xScale.domain(t.rescaleX(xScale2).domain());
        svg.select(".line").attr("d", line);
        svg.select(".axis--x").call(xAxis);

        if(selectedDate) {
            clickedLine
                .attr("x1", xScale(selectedDate.date) + margin.left)
                .attr("y1", margin.top)
                .attr("x2", xScale(selectedDate.date) + margin.left)
                .attr("y2", height + margin.top);
        }

        svg.select(".axis--x").selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
    }

    function keydown() {
        if(lastZoom === undefined) return;
        var key = d3.event.key;
        var step = 20;
        switch (key) {
            case 'ArrowLeft':
                lastZoom.transform = lastZoom.transform.translate(step, 0);
                d3.event = lastZoom;
                zoomed();
                break;
            case 'ArrowRight':
                lastZoom.transform = lastZoom.transform.translate(-step, 0);
                d3.event = lastZoom;
                zoomed();
                break;
        }
    }

    function initDateTimePicker() {
        $('#date-time-picker').datetimepicker({
            stepping: 60,
            minDate:     new Date(2014, 0,  1,  0,  0),
            maxDate:     new Date(2014, 9, 23, 13, 00),
            useCurrent: false,
            defaultDate: false,
            sideBySide: true,
            locale: "pt",
            showClose: true
        });

        $("#date-time-picker").on("dp.show", function () {
            if($("#date-time-picker input").val() === "") {
                $(this).data("DateTimePicker").date(new Date(2014, 0,  1,  0,  0));
            }
       });

       $("#date-time-picker").on("dp.change", function (e) {
        //    var date = e.date.toDate();
        //    console.log("change "+date);
        //    chart.dispatch('mouseover');
       });

        $('#date-time-picker-ok').on('click', function(e) {
            // var date = e;
            // console.log(date);
            // chart.dispatch('click');
        });
    }
}
