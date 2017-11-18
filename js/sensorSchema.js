function initSensorSchema(containerID) {
    var container = document.getElementById(containerID);
    var margin = {top: 5, right: 10, bottom: 40, left: 10}
    var width = container.clientWidth - margin.left - margin.right;
    var height = container.clientHeight - margin.top - margin.bottom;

    var svg = d3.select('#' + containerID)
        .append('svg')
        .attr('width', container.clientWidth)
        .attr('height', container.clientHeight)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")")

    addConfirmButton();

    var radius = 10;
    var xMin = margin.left + 10;
    var xMax = width - 40;

    var xStep = ((xMin + (xMax-165)) / 9);
    var yStep = 35;

    var xPosition = xMin + 85;
    var yPosition = margin.top + yStep;

    var tooltip = d3.select('#tooltip');
    var selectedSensors = config.selectedSensors === undefined ? [] : config.selectedSensors;
    var circles = d3.range(19).map(function(d, i) {
        var x, y, color;
        switch (i) {
            case 8:
                x = xPosition;
                y = yPosition;
                xPosition = xMin + 85 + xStep;
                yPosition += yStep;
                break;

            case 16:
                yPosition = 13;
                x = xMin + 10;
                y = yPosition;
                break;

            case 17:
                x = ((xMin+10) + (xMax))/2;
                y = yPosition;
                break;

            case 18:
                x = xMax;
                y = yPosition;
                break;

            default:
                x = xPosition;
                y = yPosition;
                xPosition += xStep;
        }

        return {
            x: x,
            y: y,
            color: getColor(i)
        };
    });

    svg.selectAll("circle")
        .data(circles)
        .enter().append("circle")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", radius)
            .style("fill", function(d,i) { return $.inArray(i, selectedSensors) === -1 ? "none" : d.color;})
            .style("stroke-width", 3)
            .style("stroke", function(d) { return d.color; })
            .on('mouseover', function(d, i) {
                var sensorType = 'Uniaxial';
                if(i === 16 || i === 17 || i === 18) {
                    sensorType = 'Triaxial'
                }
                d3.select(this).style("fill", d.color);

                tooltip.html(sensorType + ' Sensor <br/>Number '+ (i+1))
                    .style("left", (d3.event.pageX + 20) + "px")
                    .style("top", (d3.event.pageY - 50) + "px")
                    .style("opacity", .9);
                })
                .on('mouseout', function(d,i) {
                    tooltip
                        .style("opacity", 0)
                        .style("left", "0px")
                        .style("top", "0px");

                    if($.inArray(i, selectedSensors) === -1)
                        d3.select(this).style("fill", "none");

                })
                .on('click', function(d,i) {
                    var idx = $.inArray(i, selectedSensors);

                    if(idx === -1) {
                        selectedSensors.push(i);
                        d3.select(this).style("fill", d.color);
                    } else {
                        selectedSensors.splice(idx, 1);
                        d3.select(this).style("fill", "none");
                    }
                });

    function addConfirmButton() {
        var container = $('#' + containerID);
        container.on('click', function() {
            config.selectedSensors = selectedSensors;
            $('#accelerograms-nav').click();
        });

        // container.append('<button type="button" class="btn btn-primary" id="btn-accelerograms">Go To Accelerograms</button>');
        // container.append('<button type="button" class="btn btn-primary pull-right" id="btn-fdd">Go To FDD-SV</button>');
        //
        // container.find('#btn-accelerograms').on('click', function() {
        //     $('#accelerograms-nav').click();
        // });
        //
        // container.find('#btn-fdd').on('click', function() {
        //     $('#fdd-nav').click();
        // });
    }

    function getColor(idx, isMouseover, isClick) {
        if(idx === 16 || idx === 17 || idx === 18) {
            return "darkcyan";
        }

        return "steelblue";
    }
}
