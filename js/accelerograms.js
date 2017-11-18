function initAccelerograms(containerID) {
    var margin = {top: 15, right: 20, bottom: 80, left: 60}
    var _data;
    var timeFrame = 3600;
    var samplesPerSecond = 25;
    var maxFrequency = ((timeFrame * samplesPerSecond) / 2) / timeFrame;
    var yMinAcc = 100;
    var yMaxAcc = -100;
    var yMinSpec = 100;
    var yMaxSpec = -100;

    loadingData();

    var tooltip = d3.select('#tooltip');

    function drawAccLineChart(id, idx, data) {
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

        var xScale = d3.scaleLinear().range([0, width]).domain([0, timeFrame]);
        var xScale2 = d3.scaleLinear().range([0, width]).domain([0, timeFrame]);
        var yScale = d3.scaleLinear().range([height, 0]);

        var xAxis = d3.axisBottom(xScale).ticks((width + 2) / (height + 2) * 5);
        var yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(function(d) { return d3.format(".1f")(d*1000); });

        var zoom = d3.zoom()
            .scaleExtent([1, 40])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);

        var line = d3.line()
            .x(function(d,i) { return xScale(i/samplesPerSecond); })
            .y(function(d) { return yScale(d); });

        svg.append("defs").append("clipPath")
            .attr("id", "mask-acc-"+idx)
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var yMin = d3.min(data, function(d) { return d; });
        if(yMin < yMinAcc) {
            yMinAcc = yMin
        } else {
            yMin = yMinAcc;
        }

        var yMax = d3.max(data, function(d) { return d; });
        if(yMax > yMaxAcc) {
            yMaxAcc = yMax
        } else {
            yMax = yMaxAcc;
        }

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

        focus.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1em")
            .attr("transform", "translate("+ (width/2) +","+ (height+(2*margin.bottom/3))+")")
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
            .text("mm\u00B2/s");

        var gFocus = focus.append("g").attr("clip-path", "url(#mask-acc-"+idx+")");
        var chart = gFocus.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", .1)
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
                svg.select(".line").transition().attr("stroke-width", .4);
            } else {
                svg.select(".line").transition().attr("stroke-width", .1);
            }

            svg.select(".axis--x").selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");
        }
    }

    function drawSpecLineChart(id, idx, data) {
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

        var xScale = d3.scaleLinear().range([0, width]).domain([0, maxFrequency]);
        var xScale2 = d3.scaleLinear().range([0, width]).domain([0, maxFrequency]);
        var yScale = d3.scaleLinear().range([height, 0]);

        var xAxis = d3.axisBottom(xScale).ticks((width + 2) / (height + 2) * 5);
        var yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(function(d) { return d3.format(".2f")(d); });

        var zoom = d3.zoom()
            .scaleExtent([1, 40])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);

        var line = d3.line()
            .x(function(d,i) { return xScale(i/timeFrame); })
            .y(function(d) { return yScale(d); });

        svg.append("defs").append("clipPath")
            .attr("id", "mask-spec-"+idx)
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var yMin = d3.min(data, function(d) { return d; });
        if(yMin < yMinSpec) {
            yMinSpec = yMin
        } else {
            yMin = yMinSpec;
        }

        var yMax = d3.max(data, function(d) { return d; });
        if(yMax > yMaxSpec) {
            yMaxSpec = yMax
        } else {
            yMax = yMaxSpec;
        }

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

        focus.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1em")
            .attr("transform", "translate("+ (width/2) +","+ (height+(margin.bottom/2))+")")
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
            .text("mm\u00B2/s");

        var gFocus = focus.append("g").attr("clip-path", "url(#mask-spec-"+idx+")");
        var chart = gFocus.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "crimson")
            .attr("stroke-width", .1)
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
                svg.select(".line").transition().attr("stroke-width", .4);
            } else {
                svg.select(".line").transition().attr("stroke-width", .1);
            }

            svg.select(".axis--x").selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");
        }
    }

    function drawCombinedAccLineChart(id, selectedSensors) {
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

        var xScale = d3.scaleLinear().range([0, width]).domain([0, timeFrame]);
        var xScale2 = d3.scaleLinear().range([0, width]).domain([0, timeFrame]);
        var yScale = d3.scaleLinear().range([height, 0]);

        var xAxis = d3.axisBottom(xScale).ticks((width + 2) / (height + 2) * 5);
        var yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(function(d) { return d3.format(".1f")(d*1000); });

        var zoom = d3.zoom()
            .scaleExtent([1, 40])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);

        var maxLine = d3.line()
            .x(function(d,i) { return xScale(i/samplesPerSecond); })
            .y(function(d,i) {
                var values = [];
                for(var j = 0; j < selectedSensors.length; j++) {
                    values.push(_data.sensorData[selectedSensors[j]][i]);
                }
                return yScale(d3.max(values));
            });

        var medianLine = d3.line()
            .x(function(d,i) { return xScale(i/samplesPerSecond); })
            .y(function(d,i) {
                var values = [];
                for(var j = 0; j < selectedSensors.length; j++) {
                    values.push(_data.sensorData[selectedSensors[j]][i]);
                }
                return yScale(d3.median(values));
            });

        var minLine = d3.line()
            .x(function(d,i) { return xScale(i/samplesPerSecond); })
            .y(function(d,i) {
                var values = [];
                for(var j = 0; j < selectedSensors.length; j++) {
                    values.push(_data.sensorData[selectedSensors[j]][i]);
                }
                return yScale(d3.min(values));
            });

        svg.append("defs").append("clipPath")
            .attr("id", "mask-acc-comb")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        yScale.domain([yMinAcc, yMaxAcc]);

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
            .attr("transform", "translate("+ (width/2) +","+ (height+(2*margin.bottom/3))+")")
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
            .text("mm\u00B2/s");

        var gFocus = focus.append("g").attr("clip-path", "url(#mask-acc-comb)");
        gFocus.append("path")
            .datum(_data.sensorData[selectedSensors[0]])
            .attr("class", "line line-max")
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", .1)
            .attr("d", maxLine);

        gFocus.append("path")
            .datum(_data.sensorData[selectedSensors[0]])
            .attr("class", "line line-median")
            .attr("fill", "none")
            .attr("stroke", "yellow")
            .attr("stroke-width", .1)
            .attr("d", medianLine);

        gFocus.append("path")
            .datum(_data.sensorData[selectedSensors[0]])
            .attr("class", "line line-min")
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", .1)
            .attr("d", minLine);

        focus.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .call(zoom)
            .on("wheel", function() { d3.event.preventDefault(); });

        function zoomed() {
            var t = d3.event.transform;
            xScale.domain(t.rescaleX(xScale2).domain());
            svg.select(".line-max").attr("d", maxLine);
            svg.select(".line-median").attr("d", medianLine);
            svg.select(".line-min").attr("d", minLine);
            svg.select(".axis--x").call(xAxis);

            if(t.k > 3) {
                svg.select(".line-max").transition().attr("stroke-width", .4);
                svg.select(".line-median").transition().attr("stroke-width", .4);
                svg.select(".line-min").transition().attr("stroke-width", .4);
            } else {
                svg.select(".line-max").transition().attr("stroke-width", .1);
                svg.select(".line-median").transition().attr("stroke-width", .1);
                svg.select(".line-min").transition().attr("stroke-width", .1);
            }

            svg.select(".axis--x").selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");
        }
    }

    function drawCombinedSpecLineChart(id, selectedSensors) {
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

        var xScale = d3.scaleLinear().range([0, width]).domain([0, maxFrequency]);
        var xScale2 = d3.scaleLinear().range([0, width]).domain([0, maxFrequency]);
        var yScale = d3.scaleLinear().range([height, 0]);

        var xAxis = d3.axisBottom(xScale).ticks((width + 2) / (height + 2) * 5);
        var yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(function(d) { return d3.format(".2f")(d*10); });


        var zoom = d3.zoom()
            .scaleExtent([1, 40])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);

        var maxLine = d3.line()
            .x(function(d,i) { return xScale(i/timeFrame); })
            .y(function(d,i) {
                var values = [];
                for(var j = 0; j < selectedSensors.length; j++) {
                    values.push(_data.fft[selectedSensors[j]][i]);
                }
                return yScale(d3.max(values));
            });

        var medianLine = d3.line()
            .x(function(d,i) { return xScale(i/timeFrame); })
            .y(function(d,i) {
                var values = [];
                for(var j = 0; j < selectedSensors.length; j++) {
                    values.push(_data.fft[selectedSensors[j]][i]);
                }
                return yScale(d3.median(values));
            });

        var minLine = d3.line()
            .x(function(d,i) { return xScale(i/timeFrame); })
            .y(function(d,i) {
                var values = [];
                for(var j = 0; j < selectedSensors.length; j++) {
                    values.push(_data.fft[selectedSensors[j]][i]);
                }
                return yScale(d3.min(values));
            });

        svg.append("defs").append("clipPath")
            .attr("id", "mask-spec-comb")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        yScale.domain([yMinSpec, yMaxSpec]);

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
            .attr("transform", "translate("+ (width/2) +","+ (height+(margin.bottom/2))+")")
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
            .text("mm\u00B2/s");

        var gFocus = focus.append("g").attr("clip-path", "url(#mask-spec-comb)");
        gFocus.append("path")
            .datum(_data.fft[selectedSensors[0]])
            .attr("class", "line line-max")
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", .1)
            .attr("d", maxLine);

        gFocus.append("path")
            .datum(_data.fft[selectedSensors[0]])
            .attr("class", "line line-median")
            .attr("fill", "none")
            .attr("stroke", "yellow")
            .attr("stroke-width", .1)
            .attr("d", medianLine);

        gFocus.append("path")
            .datum(_data.fft[selectedSensors[0]])
            .attr("class", "line line-min")
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", .1)
            .attr("d", minLine);

        focus.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .call(zoom)
            .on("wheel", function() { d3.event.preventDefault(); });

        function zoomed() {
            var t = d3.event.transform;
            xScale.domain(t.rescaleX(xScale2).domain());
            svg.select(".line-max").attr("d", maxLine);
            svg.select(".line-median").attr("d", medianLine);
            svg.select(".line-min").attr("d", minLine);
            svg.select(".axis--x").call(xAxis);

            if(t.k > 3) {
                svg.select(".line-max").transition().attr("stroke-width", .4);
                svg.select(".line-median").transition().attr("stroke-width", .4);
                svg.select(".line-min").transition().attr("stroke-width", .4);
            } else {
                svg.select(".line-max").transition().attr("stroke-width", .1);
                svg.select(".line-median").transition().attr("stroke-width", .1);
                svg.select(".line-min").transition().attr("stroke-width", .1);
            }

            svg.select(".axis--x").selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");
        }
    }

    function loadingData() {
        _data = config.sensorData['14021412'];
        if(_data === undefined) {
            if($('#load').length === 0) {
                $('#' + containerID).append('<button type="button" class="btn btn-primary btn-lg " id="load" data-loading-text="<i class=\'fa fa-circle-o-notch fa-spin\'></i> Retrieving Sensor Data"></button>');
                var btn = $('#load').button('loading');
            }

            setTimeout(function() { loadingData(); }, 100);
        } else {
            console.log(_data);
            $('#accelerograms-wrapper').html('');
            addNewTitle('#accelerograms-wrapper', containerID+'-title', 'Accelerograms');
            $('#accelerograms-wrapper').append('<div class="panel-body" id="accelerograms"></div>');
            var selectedSensors = [];
            if($('#accelerograms-nav a').hasClass('active')) {
                for(var i = 0; i < config.selectedSensors.length; i++) {
                    var idx = config.selectedSensors[i];
                    if(idx === 16 || idx === 17 || idx === 18) {
                        var auxIdx = idx+1;
                        idx = idx === 16 ? 16 : (idx === 17 ? 19 : 22);
                        console.log(idx);
                        addNewPanel('#accelerograms', 'accelerograms-container-'+idx, 'Sensor '+ (auxIdx) + ' - Triaxial');
                        for(var j = 0; j < 3; j++) {
                            selectedSensors[i] = idx+j;
                            var axis = j === 0 ? 'X' : (j === 1 ? 'Y' : 'Z');
                            $('#accelerograms-container-'+idx).append('<span style="display:block; font-size:1em; text-align:center;">'+ axis +' Axis</span>');
                            $('#accelerograms-container-'+idx).append('<div class="accelerogram-container col-lg-6 col-sm-12" id="accelerogram-'+idx+j+'"></div><div class="spectrum-container col-lg-6 col-sm-12" id="spectrum-'+idx+j+'"></div>')

                            drawAccLineChart('accelerogram-'+idx+j, idx+j, _data.sensorData[idx+j]);
                            drawSpecLineChart('spectrum-'+idx+j, idx+j, _data.fft[idx+j]);
                        }
                    } else {
                        selectedSensors[i] = idx;
                        addNewPanel('#accelerograms', 'accelerograms-container-'+idx, 'Sensor '+ (idx+1));
                        $('#accelerograms-container-'+idx).append('<div class="accelerogram-container col-lg-6 col-sm-12" id="accelerogram-'+idx+'"></div><div class="spectrum-container col-lg-6 col-sm-12" id="spectrum-'+idx+'"></div>')

                        drawAccLineChart('accelerogram-'+idx, idx, _data.sensorData[idx]);
                        drawSpecLineChart('spectrum-'+idx, idx, _data.fft[idx]);
                    }
                }

                addNewPanel('#accelerograms', 'combined-values-container', 'Max (Green), Min (Orange) and Median (Yellow) values');
                $('#combined-values-container').append('<div class="accelerogram-container col-lg-6 col-sm-12" id="combined-acc-container"></div><div class="spectrum-container col-lg-6 col-sm-12" id="combined-spec-container"></div>')
                drawCombinedAccLineChart('combined-acc-container', selectedSensors);
                drawCombinedSpecLineChart('combined-spec-container', selectedSensors);
            }
        }
    }
}
