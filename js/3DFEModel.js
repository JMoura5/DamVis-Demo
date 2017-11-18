function init3DFEModel(containerID) {
    var margin = {top: 15, right: 20, bottom: 80, left: 50}
    var model = config.dam3dModel;
    var displacement;
    var data;

    loadingData();

    $('#radioDisplacement').on('click', function() {
        showComponent('threed-model-calculated');
        showComponent('threed-model-observed');
        hideComponent('threed-model-difference');
    });

    $('#radioDifference').on('click', function() {
        hideComponent('threed-model-calculated');
        hideComponent('threed-model-observed');
        showComponent('threed-model-difference');
    });

    function loadingData() {
        if(config.sensorData['14021412'] === undefined || config.sensorData['14021412'].fddsvMedian === undefined) {
            setTimeout(function() { loadingData(); }, 100);
        } else {
            data = config.sensorData['14021412'].fddsv;
            displacement = config.sensorData['14021412'].fddsvMedian;
            var calculatedDisplacement = JSON.parse(JSON.stringify(displacement)).slice(50);
            var displacementDifference = [];
            calculatedDisplacement.forEach(function(el, idx) {
                var value = el;
                for(var i = 0; i < value.U[0].length; i++) {
                    value.U[0][i] = el.U[0][i] - displacement[idx].U[0][i];
                }
                displacementDifference.push(value);
            });

            $('#load-threed-model').remove();
            showComponent('threed-fdd-spectrum');
            showComponent('threed-model-options');
            showComponent('threed-model-calculated');
            showComponent('threed-model-observed');
            showComponent('threed-model-difference');

            drawSpectrum('threed-fdd-spectrum');
            $('#threed-model-observed').append('<span style="display:block; font-size:1em; text-align:center;">Observed 3D displacement</span>');
            $('#threed-model-calculated').append('<span style="display:block; font-size:1em; text-align:center;">Calculated 3D displacement</span>');
            $('#threed-model-difference').append('<span style="display:block; font-size:1em; text-align:center;">Difference between Observed and Calculated 3D displacement</span>');
            init3dModel('threed-model-calculated', model, calculatedDisplacement);
            init3dModel('threed-model-observed', model, displacement);
            init3dModel('threed-model-difference', model, displacementDifference);
            hideComponent('threed-model-difference');
        }
    }

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

        var xScale = d3.scaleLinear().range([0, width]).domain([0, 10]);
        var xScale2 = d3.scaleLinear().range([0, width]).domain([0, 10]);
        var yScale = d3.scaleLinear().range([height, 0]);

        var xAxis = d3.axisBottom(xScale).ticks((width + 2) / (height + 2) * 5);
        var yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(function(d) { return d3.format(".1f")(d*1000); });

        var zoom = d3.zoom()
            .scaleExtent([1, 40])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);

        var line = d3.line()
            .x(function(d,i) { return xScale(i/data.length*10); })
            .y(function(d) { if(d.S.length === 0) { return yScale(0); }
                else { return yScale(d.S[0]); } });

        svg.append("defs").append("clipPath")
            .attr("id", "mask-threed-spectrum")
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

        var gFocus = focus.append("g").attr("clip-path", "url(#mask-threed-spectrum)");
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
            .on("wheel", function() { d3.event.preventDefault(); });;

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
}
