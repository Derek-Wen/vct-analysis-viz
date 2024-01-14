function finalproject(){
    var filePath="data.csv";
    plot1(filePath);
    plot2(filePath);
    plot3(filePath);
    plot4(filePath);
    plot5(filePath);
}

var plot1 = function(filePath){
    d3.csv(filePath).then(function(data) {
        var margin = { top: 50, right: 50, bottom: 50, left: 100 },
            svgWidth = 1000,
            svgHeight = 500;

        var scatterData = data.map(function(d) {
        return {
            maps: +d.Maps,
            kda: +d.KDA
            };
        });

        var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        var svg = d3.select("#plot_1")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xScale = d3.scaleLinear()
        .domain([0, d3.max(scatterData, function(d) { return d.maps; })])
        .range([0, svgWidth - margin.left - margin.right]);

        var yScale = d3.scaleLinear()
        .domain([0, d3.max(scatterData, function(d) { return d.kda; })])
        .range([svgHeight - margin.top - margin.bottom, 0]);

        svg.selectAll("circle")
        .data(scatterData)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return xScale(d.maps); })
        .attr("cy", function(d) { return yScale(d.kda); })
        .attr("r", 5)
        .attr("fill", "black")
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Maps: " + d.maps + "<br/>KDA: " + d.kda)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            })
        .on("click", function() {
            var circle = d3.select(this);
            if (circle.attr("fill") === "black") {
                circle.attr("fill", "red");
            } else {
                circle.attr("fill", "black");
            }
        });

        svg.append("g")
        .attr("transform", "translate(0," + (svgHeight - margin.top - margin.bottom) + ")")
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", (svgWidth - margin.left - margin.right) / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Maps");

        svg.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(svgHeight - margin.top - margin.bottom) / 2)
        .attr("y", -30)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("KDA");

        svg.append("text")
        .attr("x", (svgWidth - margin.left - margin.right) / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "25px")
        .text("VCT: Maps vs. KDA");
    });
};


var plot2 = function(filePath) {
  d3.csv(filePath).then(function(data) {
    var margin = { top: 50, right: 100, bottom: 50, left: 200 },
      svgWidth = 1000,
      svgHeight = 500;

    var teamData = d3.group(data, function(d) { return d.Team; });
    var teamMapTotals = Array.from(teamData, function([key, value]) {
      return { team: key, maps: d3.sum(value, function(d) { return +d.Maps; }) };
    });

    var svg = d3.select("#plot_2")
    .append("svg")
    .attr("width", svgWidth + margin.left + margin.right)
    .attr("height", svgHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scaleLinear()
    .domain([0, d3.max(teamMapTotals, function(d) { return d.maps; })])
    .range([0, svgWidth]);

    var yScale = d3.scaleBand()
    .domain(teamMapTotals.map(function(d) { return d.team; }))
    .range([0, svgHeight])
    .padding(0.1);

    var bars = svg.selectAll(".bar")
    .data(teamMapTotals)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", function(d) { return yScale(d.team); })
    .attr("width", function(d) { return xScale(d.maps); })
    .attr("height", yScale.bandwidth())
    .on("mouseover", function() { d3.select(this).attr("fill", "red"); })
    .on("mouseout", function() { d3.select(this).attr("fill", null); });;

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + svgHeight + ")")
    .call(xAxis);

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

    svg.append("text")
    .attr("class", "plot-title")
    .attr("x", (svgWidth / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "25px")
    .text("VCT: Total Maps Played by Team");

    svg.append("text")
    .attr("class", "axis-label")
    .attr("x", svgWidth / 2)
    .attr("y", svgHeight + margin.bottom - 10)
    .attr("text-anchor", "middle")
    .text("Maps Played");

    svg.append("text")
    .attr("class", "axis-label")
    .attr("x", 0 - (svgHeight / 2))
    .attr("y", (svgWidth / 2) - 600)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-size", "15px")
    .text("Team");

    var isDescending = false;

    var sortBars = function() {
      teamMapTotals.sort(function(a, b) {
        return isDescending ? d3.ascending(a.maps, b.maps) : d3.descending(a.maps, b.maps);
      });

      yScale.domain(teamMapTotals.map(function(d) { return d.team; }));

      bars.transition()
      .duration(500)
      .attr("y", function(d) { return yScale(d.team); });

      svg.select(".y.axis")
      .transition()
      .duration(500)
      .call(yAxis);

      isDescending = !isDescending;
    };

    d3.select("#sort_button")
      .on("click", function() {
        sortBars();
      });
  });
};

var plot3 = function(filePath) {
  d3.csv(filePath).then(function(data) {
    var margin = {top: 100, right: 150, bottom: 50, left: 60},
      svgWidth = 1000,
      svgHeight = 500;

    var filteredData = data.filter(function(d) {
      return ["OpTic Gaming", "Gambit Esports", "KRÜ Esports", "Sentinels"].includes(d.Team);
    });

    filteredData.forEach(function(d) {
      d.DPM = +d.D / +d.Maps;
    });

    var svg = d3.select("#plot_3")
    .append("svg")
    .attr("width", svgWidth + margin.left + margin.right)
    .attr("height", svgHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
    .range([0, svgWidth])
    .domain(filteredData.map(function(d) { return d.Player; }))
    .padding(0.6);

    var y = d3.scaleLinear()
    .domain([0, d3.max(filteredData, function(d) { return +d.DPM; })])
    .range([svgHeight, 0]);

    svg.append("g")
    .attr("transform", "translate(0," + svgHeight + ")")
    .style("font-size", "10px")
    .call(d3.axisBottom(x));

    svg.append("g")
    .call(d3.axisLeft(y));

    svg.append("text")
    .attr("transform", "translate(" + (svgWidth / 2) + " ," + (svgHeight + margin.top -60) + ")")
    .style("text-anchor", "middle")
    .text("Players");

    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (svgHeight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Deaths per Map");

    svg.append("text")
    .attr("x", (svgWidth / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "25px")
    .text("VCT: Deaths per Map of Players from Top 4 VCT Teams");

    var teamColors = {
      "OpTic Gaming": "green",
      "Gambit Esports": "maroon",
      "KRÜ Esports": "pink",
      "Sentinels": "red"
    };

    svg.selectAll(".bar")
    .data(filteredData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.Player); })
    .attr("y", function(d) { return y(+d.DPM); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return svgHeight - y(+d.DPM); })
    .style("fill", function(d) { return teamColors[d.Team]; });

    var legend = svg.append("g")
    .attr("font-size", "14px")
    .attr("text-anchor", "left")
    .selectAll("g")
    .data(Object.keys(teamColors))
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
    .attr("x", svgWidth - 19)
    .attr("width", 19)
    .attr("height", 19)
    .style("fill", function(d) { return teamColors[d]; });

    legend.append("text")
    .attr("x", svgWidth + 5)
    .attr("y", 10)
    .attr("dy", "0.32em")
    .text(function(d) { return d; });
  });
};

var plot4 = function(filePath) {
  d3.csv(filePath).then(function(data) {
    var svgWidth = 1000;
    var svgHeight = 750;

    const projection = d3.geoNaturalEarth1()
    .scale(200)
    .translate([svgWidth / 2, svgHeight / 2]);

    const pathgeo = d3.geoPath()
    .projection(projection);

    const dataByCountry = d3.group(data, d => d.Country);

    const avgACSByCountry = d3.rollup(data, v => d3.mean(v, d => d["ACS/Map"]), d => d.Country);

    const svg = d3.select("#plot_4")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    d3.json("world.json").then(function(world) {
      svg.append("g")
      .selectAll("path")
      .data(world.features)
      .enter()
      .append("path")
      .attr("d", pathgeo)
      .style("fill", "lightgrey")
      .style("stroke", "white");

      const radiusScale = d3.scaleLinear()
      .domain([0, d3.max(Array.from(avgACSByCountry.values()))])
      .range([0, 25]);

      svg.append("g")
      .selectAll("circle")
      .data(world.features.filter(d => avgACSByCountry.has(d.properties.name)))
      .enter()
      .append("circle")
      .attr("cx", d => pathgeo.centroid(d)[0])
      .attr("cy", d => pathgeo.centroid(d)[1])
      .attr("r", d => radiusScale(avgACSByCountry.get(d.properties.name)))
      .style("fill", "rgba(255, 0, 0, 0.5)")
      .style("stroke", "white");

      const legendWidth = 200;
      const legendHeight = 50;
      const legend = svg.append("g")
      .attr("transform", "translate(" + (svgWidth - legendWidth - 100) + ", " + (svgHeight - legendHeight - 20) + ")");

      const legendData = [50, 100, 150, 200, 250, 300];

      const legendXScale = d3.scaleLinear()
      .domain(d3.extent(legendData))
      .range([0, legendWidth]);

      const legendXAxis = d3.axisBottom(legendXScale)
      .tickValues(legendData)
      .tickFormat(d => `${d}`);

      legend.append("g")
      .attr("transform", "translate(0, " + (legendHeight) + ")")
      .call(legendXAxis);

      legend.selectAll("circle")
      .data(legendData)
      .enter()
      .append("circle")
      .attr("cx", d => legendXScale(d))
      .attr("cy", legendHeight / 2)
      .attr("r", d => radiusScale(d))
      .style("fill", "rgba(255, 0, 0, 0.5)")
      .style("stroke", "white");

      legend.append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Average ACS");

      svg.append("text")
      .attr("x", svgWidth / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .style("font-size", "25px")
      .text("VCT: Average ACS by Country");
    });
  });
};

var plot5 = function(filePath) {
  d3.csv(filePath).then(function(data) {
    var margin = { top: 50, right: 20, bottom: 90, left: 150 };
      svgWidth = 1000;
      svgHeight = 500;

    var countries = ["United States", "Brazil", "Russia", "Spain", "South Korea"];
    var playersByCountry = countries.map(country => ({
      country,
      data: data.filter(d => d.Country === country)
    }));

    playersByCountry.forEach(countryData => {
      countryData.data.sort((a, b) => a["ACS/Map"] - b["ACS/Map"]);
      countryData.quartiles = {
        q1: d3.quantile(countryData.data.map(d => +d["ACS/Map"]), 0.25),
        median: d3.quantile(countryData.data.map(d => +d["ACS/Map"]), 0.5),
        q3: d3.quantile(countryData.data.map(d => +d["ACS/Map"]), 0.75)
      };
      const iqr = countryData.quartiles.q3 - countryData.quartiles.q1;
      const min = countryData.quartiles.q1 - 1.5 * iqr;
      const max = countryData.quartiles.q3 + 1.5 * iqr;
      countryData.outliers = countryData.data.filter(d => d["ACS/Map"] < min || d["ACS/Map"] > max);
    });
    
    var svg = d3.select("#plot_5")
    .append("svg")
    .attr("width", svgWidth + margin.left + margin.right)
    .attr("height", svgHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y = d3.scaleBand()
    .range([0, svgHeight])
    .domain(countries)
    .paddingInner(1)
    .paddingOuter(.5);
  
    svg.append("g")
    .call(d3.axisLeft(y));
      
    var x = d3.scaleLinear()
    .domain([0, d3.max(playersByCountry.flatMap(countryData => countryData.data), d => +d["ACS/Map"])])
    .range([0, svgWidth]);
  
    svg.append("g")
    .attr("transform", "translate(0," + svgHeight + ")")
    .call(d3.axisBottom(x));
  
    var boxHeight = 50;
    var box = svg.selectAll(".box")
    .data(playersByCountry)
    .enter().append("g")
    .attr("class", "box")
    .attr("transform", d => "translate(0," + y(d.country) + ")");

    box.append("rect")
    .attr("class", "box")
    .attr("width", d => x(d.quartiles.q3) - x(d.quartiles.q1))
    .attr("height", boxHeight)
    .attr("x", d => x(d.quartiles.q1))
    .attr("y", -boxHeight / 2)
    .attr("stroke", "black")
    .attr("fill", "rgba(255, 0, 0, 0.5)");
    
    box.append("line")
    .attr("x1", d => x(d.quartiles.median))
    .attr("x2", d => x(d.quartiles.median))
    .attr("y1", -boxHeight / 2)
    .attr("y2", boxHeight / 2)
    .attr("stroke", "black");
    
    box.append("line")
    .attr("x1", d => x(d3.min(d.data, d => +d["ACS/Map"])))
    .attr("x2", d => x(d3.max(d.data, d => +d["ACS/Map"])))
    .attr("y1", 0)
    .attr("y2", 0)
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "3,3");
    
    box.append("line")
    .attr("x1", d => x(d3.min(d.data, d => +d["ACS/Map"])))
    .attr("x2", d => x(d3.min(d.data, d => +d["ACS/Map"])))
    .attr("y1", -boxHeight / 2)
    .attr("y2", boxHeight / 2)
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "3,3");
    
    box.append("line")
    .attr("x1", d => x(d3.max(d.data, d => +d["ACS/Map"])))
    .attr("x2", d => x(d3.max(d.data, d => +d["ACS/Map"])))
    .attr("y1", -boxHeight / 2)
    .attr("y2", boxHeight / 2)
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "3,3");
  
    var outliers = svg.append("g")
    .selectAll(".outlier")
    .data(playersByCountry.flatMap(countryData => countryData.outliers.map(outlier => ({...outlier, country: countryData.country}))))
    .enter().append("circle")
    .attr("class", "outlier")
    .attr("cx", d => x(d["ACS/Map"]))
    .attr("cy", d => y(d.country))
    .attr("r", 4)
    .style("fill", "white")
    .style("stroke", "black")
    .style("stroke-width", 1.5);

    svg.append("text")
    .attr("x", svgWidth / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "25px")
    .text("ACS/Map Box Plots for Selected Countries");

    svg.append("text")
    .attr("x", svgWidth / 2)
    .attr("y", 10 + svgHeight + margin.bottom * 2 / 3)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("ACS/Map");

    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left * 2 / 3)
    .attr("x", -svgHeight / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("Country");
  });
};



