function initFDD(containerID) {
    var margin = {top: 15, right: 20, bottom: 80, left: 50}
    var data, dataMedian;
    var maxFrequency = 10;
    var selectedSensors = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
    var disabledSensors = [];
    var color = ['#1776b6','#ff7f00','#24a122','#d8241f','#9464bf','#8d564a','#e574c3','#7f7f7f','#bcbe00', '#00bed0', '#adc6e9', '#96e086', '#ff9794', '#c59c93', '#f9b5d2', '#dbdc88'];
    var tooltip = d3.select('#tooltip');

    loadingData();

    function drawSpectrum(id) {
        var container = document.getElementById(id);
        var containerWidth = container.clientWidth;
        var containerHeight = container.clientHeight;
        var width = containerWidth - margin.left - margin.right;
        var height = containerHeight - margin.top - margin.bottom;

        var svg = d3.select('#' + id)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .append("g");

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1em")
            .attr("transform", "translate("+ (width/2) +",0)")
            .text("Response Spectrum");

        var xScale = d3.scaleLinear().range([0, width]).domain([0, maxFrequency]);
        var xScale2 = d3.scaleLinear().range([0, width]).domain([0, maxFrequency]);
        var yScale = d3.scaleLinear().range([height, 0]);

        var xAxis = d3.axisBottom(xScale).ticks((width + 2) / (height + 2) * 5);
        var yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(function(d) { return d3.format(".1f")(d*1000); });

        var zoom = d3.zoom()
            .scaleExtent([1, 40])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);

        var line = d3.line()
            .x(function(d,i) { return xScale(i/data.length*maxFrequency); })
            .y(function(d) { if(d.S.length === 0) { return yScale(0); }
                else { return yScale(d.S[0]); } });

        svg.append("defs").append("clipPath")
            .attr("id", "mask-fdd")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        yScale.domain(d3.extent(data, function(d) { if(d.S.length === 0) { return 0; }
            else { return d.S[0]; }}));

        var gXAxis = focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        gXAxis.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        focus.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1em")
            .attr("transform", "translate("+ (width/2) +","+ (height+(margin.bottom/2)+5)+")")
            .text("Frequency (Hz)");

        var gYAxis = focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        focus.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Amplitude");

        var gFocus = focus.append("g").attr("clip-path", "url(#mask-fdd)");
        var chart = gFocus.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1)
            .attr("d", line);

        focus.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .call(zoom)
            .on("wheel", function() { d3.event.preventDefault(); });

        function zoomed() {
            var t = d3.event.transform;
            xScale.domain(t.rescaleX(xScale2).domain());
            svg.select(".line").attr("d", line);
            svg.select(".axis--x").call(xAxis);

            if(t.k > 3) {
                svg.select(".line").transition().attr("stroke-width", 1.4);
            } else {
                svg.select(".line").transition().attr("stroke-width", 1);
            }

            svg.select(".axis--x").selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");
        }
    }

    function drawDisplacement(id) {
        getSelectedSensors();

        var container = document.getElementById(id);
        var containerWidth = container.clientWidth;
        var containerHeight = container.clientHeight;
        var width = containerWidth - margin.left - margin.right;
        var height = containerHeight - margin.top - margin.bottom;

        var svg = d3.select('#' + id)
            .append('svg')
            .attr('width', containerWidth)
            .attr('height', containerHeight)
            .append("g");

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1em")
            .attr("transform", "translate("+ (width/2) +",0)")
            .text("Responses in Displacement");

        var xScale = d3.scaleLinear().range([0, width]).domain([0, 1]);
        var xScale2 = d3.scaleLinear().range([0, width]).domain([0, 1]);
        var yScale = d3.scaleLinear().range([height, 0]);

        var xAxis = d3.axisBottom(xScale).ticks((width + 2) / (height + 2) * 5);
        var yAxis = d3.axisLeft(yScale).ticks(10);

        var zoom = d3.zoom()
            .scaleExtent([1, 40])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);

        svg.append("defs").append("clipPath")
            .attr("id", "mask-fdd-displacement")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        yScale.domain([-1, 1]);

        var gXAxis = focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        gXAxis.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        focus.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1em")
            .attr("transform", "translate("+ (width/2) +","+ (height+(margin.bottom/2)+5)+")")
            .text("Time (s)");

        var gYAxis = focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        focus.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Amplitude");

        focus.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .call(zoom)
            .on("wheel", function() { d3.event.preventDefault(); });

        var gFocus = focus.append("g").attr("clip-path", "url(#mask-fdd-displacement)");

        for(var i = 0; i < selectedSensors.length; i++) {
            var line = d3.line()
                .curve(d3.curveBasis)
                .x(function(d,idx) { return xScale(idx/dataMedian.length); })
                .y(function(d) { if(d.U.length === 0) { return yScale(0); }
                    else { return yScale(d.U[0][selectedSensors[i]]); } });

            var chart = gFocus.append("path")
                .datum(dataMedian)
                .attr("id", "line"+selectedSensors[i])
                .attr("sensor", selectedSensors[i]+1)
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", color[selectedSensors[i]])
                .attr("stroke-width", 1)
                .attr("d", line);

            chart.on('mouseover', function() {
                var target = d3.event.target;

                tooltip.html("Sensor "+ target.attributes["sensor"].value)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");

                tooltip.style("opacity", .9);
            }).on('mouseout', function() {
                tooltip
                    .style("opacity", 0)
                    .style("left", "0px")
                    .style("top", "0px");
            });
        }

        function zoomed() {
            var t = d3.event.transform;
            xScale.domain(t.rescaleX(xScale2).domain());

            for(var i = 0; i < selectedSensors.length; i++) {
                var line = d3.line()
                    .curve(d3.curveBasis)
                    .x(function(d,idx) { return xScale(idx/dataMedian.length); })
                    .y(function(d) { if(d.U.length === 0) { return yScale(0); }
                        else { return yScale(d.U[0][selectedSensors[i]]); } });

                svg.select("#line"+selectedSensors[i]).attr("d", line);
            }

            svg.select(".axis--x").call(xAxis);

            if(t.k > 3) {
                svg.select(".line").transition().attr("stroke-width", 1.5);
            } else {
                svg.select(".line").transition().attr("stroke-width", 1);
            }

            svg.select(".axis--x").selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
        }
    }

    function drawDisplacement3d(id) {
        $('#'+id).append('<span style="display:block; font-size:1em; text-align:center;">Responses in 3D Displacement</span>');

        init3dModel(id, config.dam3dModel, dataMedian);
    }

    function loadingData() {
        if(config.sensorData['14021412'] === undefined || config.sensorData['14021412'].fddsv === undefined) {
            hideComponent('fdd-spectrum');
            hideComponent('fdd-displacement-list');
            hideComponent('fdd-displacement');
            hideComponent('fdd-displacement-3d');

            setTimeout(function() { loadingData(); }, 100);
        } else {
            data = config.sensorData['14021412'].fddsv;
            dataMedian = config.sensorData['14021412'].fddsvMedian;
            // console.log(dataMedian);
            // console.log(max);
            // console.log(min);

            $('#load-fdd').remove();
            if($('#fdd-nav a').hasClass('active')) {
                showComponent('fdd-spectrum');
                showComponent('fdd-displacement-list');
                showComponent('fdd-displacement');
                showComponent('fdd-displacement-3d');

                drawSpectrum('fdd-spectrum');
                drawDisplacement('fdd-displacement');
                drawDisplacement3d('fdd-displacement-3d');
            }
        }
    }

    function getSelectedSensors() {
        $('#fdd-displacement-list').html('');
        $('#fdd-displacement').html('');

        for(var i = 0; i < 16; i++) {
            var idx = selectedSensors.indexOf(i);

            if(idx === -1) {
                $('#fdd-displacement-list').append('<div class="list-group-item  col-md-4 col-lg-2 text-center"><button type="button" '+
                    'class="btn btn-primary btn-sm disabled-sensor" value='+i+' id="fdd-displacement-list-'+i+'">Sensor '+(i+1)+'</button></div>');
            } else {
                $('#fdd-displacement-list').append('<div class="list-group-item col-md-4 col-lg-2 text-center"><button type="button" '+
                    'class="btn btn-primary btn-sm" value='+i+' id="fdd-displacement-list-'+i+'">Sensor '+(i+1)+'</button></div>');
            }
        }

        $('#fdd-displacement-list').append('<div class="list-group-item col-md-4 col-lg-2 text-center"><button type="button" '+
            'class="btn btn-primary btn-sm select-clear-btn" value=16 id="fdd-displacement-list-'+i+'">Select All</button></div>');
        $('#fdd-displacement-list').append('<div class="list-group-item col-md-4 col-lg-2 text-center"><button type="button" '+
            'class="btn btn-primary btn-sm select-clear-btn" value=17 id="fdd-displacement-list-'+i+'">Clear All</button></div>');

        $('#fdd-displacement-list button').on('click', function() {
            var value = +$(this).val();

            if(value === 16) {
                selectedSensors = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
                disabledSensors = [];
                drawDisplacement('fdd-displacement');
                return;
            }
            if(value === 17) {
                disabledSensors = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
                selectedSensors = [];
                drawDisplacement('fdd-displacement');
                return;
            }

            var idx = selectedSensors.indexOf(value);

            if(idx === -1) {
                selectedSensors.push(value);
                disabledSensors.splice(disabledSensors.indexOf(value), 1);
                selectedSensors.sort(function(a, b) {
                    return a - b;
                });
            } else {
                disabledSensors.push(value);
                selectedSensors.splice(idx, 1);
                disabledSensors.sort(function(a, b) {
                    return a - b;
                });
            }

            drawDisplacement('fdd-displacement');
        });
    }
}
