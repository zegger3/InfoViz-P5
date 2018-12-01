// Global functions called when select elements are changed
function onXScaleChanged() {
    var select = d3.select('#xScaleSelect').node();
    chartScales.x = select.options[select.selectedIndex].value
    updateChart();
}

function onYScaleChanged() {
    var select = d3.select('#yScaleSelect').node();
    chartScales.y = select.options[select.selectedIndex].value
    updateChart();
}


var svg = d3.select('svg');

// layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 40, r: 40, b: 40, l: 40};

// chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// group element for appending chart elements
var chartEls = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

var xAxisG = chartEls.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate('+[0, chartHeight]+')');

var yAxisG = chartEls.append('g')
    .attr('class', 'y axis');

var transitionScale = d3.transition()
    .duration(600)
    .ease(d3.easeLinear);

d3.csv('./colleges.csv',
    function(row) {
        return {
            'Name': row['Name'],
            'Average Cost': +row['Average Cost'],
            'Median Debt on Graduation': +row['Median Debt on Graduation'],
            'Median Earnings 8 years After Entry': +row['Median Earnings 8 years After Entry']        
        };
    },
    function(error, data) {
        if(error) {
            console.error('Error while loading ./colleges.csv');
            console.error(error);
            return;
        }

        // global variable
        colleges = data;

        // scales
        xScale = d3.scaleLinear()
            .range([0, chartWidth]);
        yScale = d3.scaleLinear()
            .range([chartHeight, 0]);

        // min, max here for all dataset columns
        domainMap = {};

        data.columns.forEach(function(column) {
            domainMap[column] = d3.extent(data, function(d){
                return d[column];
            });
        });

        chartScales = {x: 'Median Debt on Graduation', y: 'Average Cost'};
        updateChart();
    });


function updateChart() {
    // update scales
    yScale.domain(domainMap[chartScales.y]).nice();
    xScale.domain(domainMap[chartScales.x]).nice();

    // update text on axes
    xAxisG.transition()
        .duration(750) // transition
        .call(d3.axisBottom(xScale));
    yAxisG.transition()
        .duration(750) // transition
        .call(d3.axisLeft(yScale));

    // scatterplot circles
    var dots = chartEls.selectAll('.dot')
        .data(colleges);

    var dotsEnter = dots.enter()
        .append('g')
        .attr('class', 'dot')
        .on('mouseover', function(d){ 
            var hovered = d3.select(this);
            hovered.select('text')
                .style('visibility', 'visible');
            // highlight circle by adding stroke
            hovered.select('circle')
                .style('stroke-width', 2)
                .style('stroke', '#333');
        })
        .on('mouseout', function(d){ 
            var hovered = d3.select(this);
            // remove highlighting
            hovered.select('text')
                .style('visibility', 'hidden');
            hovered.select('circle')
                .style('stroke-width', 0)
                .style('stroke', 'none');
        });

    // append a circle to the ENTER selection
    dotsEnter.append('circle')
        .attr('r', 3);

    // append a text to the ENTER selection
    dotsEnter.append('text')
        .attr('y', -10)
        .text(function(d) {
            return d.Name;
        });

    // ENTER + UPDATE selections
    dots.merge(dotsEnter)
        .transition()
        .duration(750)
        .attr('transform', function(d) {
            var tx = xScale(d[chartScales.x]);
            var ty = yScale(d[chartScales.y]);
            return 'translate('+[tx, ty]+')';
        });
    }




