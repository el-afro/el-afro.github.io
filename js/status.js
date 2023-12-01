// Those value probably need be change to the current svg
const MARGIN = { left: 100, bottom: 20, top: 30, right: 50 };
const Width = 500;
const Height = 360;
const BWidth = 1000;
// KAST, KPR, HeadShot %, Impact, Rating
const Max = [77.7, 0.9, 62.9, 1.47, 1.33];
const Mean = [71.04, 0.67, 46.03, 1.02, 1.06];
const Min = [64.4, 0.5, 20.5, 0.77, 0.86];
const Quart1st = [69.33, 0.63, 41.53, 0.94, 1];
const Quart3rd = [73.08, 0.7, 52.28, 1.09, 1.11];
const tournamentName = ["BLAST Premier Spring Final", "BLAST Premier Fall Groups", "IEM Cologne 2023", "Gamers8 2023", "ESL Pro League Season 18", "IEM Sydney 2023"];
var playerPath;
var dot1, dot2, dot3, dot4, dot5;
var line1, line2, line3, line4, line5;
let boxCount = 0;

const playerToTeam = new Map();
const Teams = new Map();
fetchJSONFile('Data/Teams.json', function (teamData) {
  for (const team of teamData){
    Teams.set(team["Team"], new TEAM(team["Team"], team["HLTV Rank"], team["Valve Rank"], team["Weeks in Top 30"], team["Region"], team["Country"]));
  }
  makeData();
});

function setup() {
  const selectPlayer = document.getElementById('selectedPlayer');

  selectPlayer.addEventListener('change', update);
}

// Helper function to format label text (you can adjust this based on your needs)
function formatLabel(value) {
  return value.toFixed(2);
}

function update() {
    var playerName = d3.select("#selectedPlayer").node().value;
    var teamName = playerToTeam.get(playerName);
    const teamImage = document.getElementById('playerTeamLogo');
    const playerImage = document.getElementById('playerImage');
    const playerTeamName = document.getElementById("playerTeamName");

    playerTeamName.textContent = teamName;
    playerImage.setAttribute('src', `./images/${teamName}/${playerName}.png`);
    teamImage.setAttribute('src', `./images/${teamName}/${teamName}.png`);
    drawBoxPlot(playerName, teamName);
    drawspiderGraph(playerName, teamName);
    drawLineGraph(playerName, teamName);
}

function drawspiderGraph(playerName, teamName) {
    d3.select("#spiderGraph").selectAll(".legend").remove();

    const svg = d3.select('#spiderGraph');
    const criteria = ["KAST", "KPR", "Headshot %", "Impact", "Rating"];
    var scaleList = [
        [64.0, 68.0, 72.0, 76.0, 80.0], // KAST
        [0.58, 0.66, 0.74, 0.82, 0.9], // KPR
        [29.0, 38.0, 47.0, 56.0, 65.0], // Headshot
        [0.86, 1.02, 1.18, 1.34, 1.50], // Impact
        [0.92, 1.04, 1.16, 1.28, 1.40], // Rating 2.0
    ];

    var startingPoint = [60.0, 0.5, 20.0, 0.7, 0.8];

    function getRScale(index) {
        return d3.scaleLinear()
        .range([0, 150])
        .domain([startingPoint[index], scaleList[index][4]]);
    }

    // grab the player data
    var Player = Teams.get(teamName).Players.get(playerName);
    var playerStatus = makePlayerStatus(Player);
    

    var playerArray = Array.from(playerStatus).map(entry => {
        return { axis: entry[0], value: entry[1] };
    })

    var gridAxis = svg.append("g")
    .attr("class", "radarWrapper")
    .attr("transform", function () {
      return `translate(${Width/2}, ${Height/2 + 25})`
    });

    // Define variables to hold tooltip elements
    let hoverBox = svg.append("rect")
    .attr("class", "tooltip-box")
    .attr("width", 150)
    .attr("height", 100)
    .attr("rx", 10) // Rounded corners
    .attr("ry", 10)
    .style("fill", "black") // Black background color
    .style("opacity", 0.8) // Adjust opacity
    .style("stroke", "white") // White border
    .style("stroke-width", 1.5) // Border width
    .style("filter", "drop-shadow(0 0 5px rgba(0,0,0,0.5))") // Add a drop shadow
    .style("display", "none");
    
    let hoverText = svg.append("text")
    .attr("class", "tooltip")
    .style("display", "none")
    .style("font-size", "12px") // Adjust font size
    .style("font-family", "Arial")
    .style("fill", "white")
    .style("pointer-events", "none");

    // the background circle
    gridAxis.selectAll(".levels")
    .data(d3.range(1, 6))
    .enter()
    .append("circle")
    .attr("class", "gridCircle")
    .attr("r", function (d) {
        return (150 / 5) * d;
    })
    .style("fill", "none")
    .style("stroke", "white");

    // aka: 5 criteria
    var numAxes = scaleList.length;

    // Calculate the angle for each axis
    var angleSlice = (2 * Math.PI) / numAxes;
    // Create a function to convert data to coordinates
    var startRadarLine = d3.radialLine()
    .curve(d3.curveLinearClosed)
    .radius(function (d, i) { return 0; })
    .angle((d, i) => i * angleSlice);

    var radarLine = d3.radialLine()
    .curve(d3.curveLinearClosed)
    .radius(function (d, i) { return getRScale(i)(d.value); })
    .angle((d, i) => i * angleSlice);

    // Draw the axes
    var axis = gridAxis.selectAll(".axis")
    .data(d3.range(numAxes))
    .enter().append("g")
    .attr("class", "axis");

    axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", function (d, i) { return getRScale(i)(scaleList[i][4]) * Math.cos(angleSlice * i - Math.PI / 2); })
    .attr("y2", function (d, i) { return getRScale(i)(scaleList[i][4]) * Math.sin(angleSlice * i - Math.PI / 2); })
    .attr("class", "line")
    .style("stroke", "white")
    .style("stroke-width", "2px");

    // Draw or update the radar chart for the player
    if (!playerPath) {
        // If playerPath doesn't exist, create it as a D3 selection
        playerPath = gridAxis.append("path")
        .datum(playerArray)
        .attr("class", "radarArea")
        .style("fill", "steelblue")
        .style("fill-opacity", 0.7)
        .style("stroke", "steelblue")
        .style("stroke-width", "2px")
        .attr("d", startRadarLine);
    }
    // Continue using playerPath as a D3 selection
    playerPath.datum(playerArray)
    .transition()
    .duration(1000)
    .delay(function(d,i){
        return i * 50;
    })
    .attr("d", radarLine);

    // Draw the radar chart for the player
    playerPath.on("mousemove", function (event, d) {
    const [x, y] = d3.pointer(event);

    // Position the tooltip relative to the chart rather than the mouse cursor
    var hoverX = x + 170; // Adjust the offset as needed
    var hoverY = y + 250; // Adjust the offset as needed

    hoverBox
    .attr("x", hoverX)
    .attr("y", hoverY - 10);

    hoverText
    .attr("x", hoverX + 5)
    .attr("y", hoverY + 7)

    // Split the tooltip text into two lines using <tspan>
    hoverText.text(`Player Name: ${playerName}`);
    hoverText.append("tspan")
    .attr("x", hoverX + 5)
    .attr("dy", "1.2em") // Line spacing
    .text(`KAST: ${parseFloat(playerArray[0]['value']).toFixed(2)}`);
    hoverText.append("tspan")
    .attr("x", hoverX + 5)
    .attr("dy", "1.2em") // Line spacing
    .text(`KPR: ${parseFloat(playerArray[1]['value']).toFixed(2)}`);
    hoverText.append("tspan")
    .attr("x", hoverX + 5)
    .attr("dy", "1.2em") // Line spacing
    .text(`Headshot %: ${parseFloat(playerArray[2]['value']).toFixed(2)}`);
    hoverText.append("tspan")
    .attr("x", hoverX + 5)
    .attr("dy", "1.2em") // Line spacing
    .text(`Impact: ${parseFloat(playerArray[3]['value']).toFixed(2)}`);
    hoverText.append("tspan")
    .attr("x", hoverX + 5)
    .attr("dy", "1.2em") // Line spacing
    .text(`Rating: ${parseFloat(playerArray[4]['value']).toFixed(2)}`);
    hoverBox.style("display", "block");
    hoverText.style("display", "block");
    })
    .on("mouseout", function () {
    // Hide the tooltip elements on mouseout
    hoverBox.style("display", "none");
    hoverText.style("display", "none");
    })

    let xOffset = [-10, 10, 0, -25, -50];
    let yOffset = [-5, 0, 25, 25, 0];

    axis.append("text")
    .attr("class", "legend")
    .style("font-size", "20px")
    .style("fill", "white")
    .style("stroke", "white")
    .style("font-family", "Teko")
    .attr("x", function (d, i) { return getRScale(i)(scaleList[i][4]) * Math.cos(angleSlice * i - Math.PI / 2) + xOffset[i]; })
    .attr("y", function (d, i) { return getRScale(i)(scaleList[i][4]) * Math.sin(angleSlice * i - Math.PI / 2) + yOffset[i]; })
    .text(function (d, i) { return criteria[i]; });

    
    scaleList.forEach(function (data, dataIndex) {
        var labels = gridAxis.selectAll(".level-label-" + dataIndex)
        .data(d3.range(1, 6)) // Use the same range as for the circles
        .enter()
        .append("text")
        .attr("class", "level-label level-label-" + dataIndex)
        .attr("dy", "0.4em") // Adjust the distance from the circle
        .style("fill", "white")
        .style("font-size", "10px")
        .text(function (d) { return scaleList[dataIndex][d - 1]; }); // Adjust the index based on your scaleList

        var angle = -Math.PI / 2 + dataIndex * angleSlice;

        labels.each(function (d, i) {
        d3.select(this)
            .attr("x", getRScale(dataIndex)(scaleList[dataIndex][i]) * Math.cos(angle))
            .attr("y", getRScale(dataIndex)(scaleList[dataIndex][i]) * Math.sin(angle));
        });
    });
}

function drawBoxPlot(playerName, teamName) {
    // Remove any existing SVG elements
    let criteria = ["KAST", "KPR", "%HS", "Impact", "Rating"];
    
    // Create a new SVG element
    const svg = d3.select("#box_Plot")
      .append("g")
      .attr("transform", "translate(" + 0 + "," + MARGIN.top + ")");;
  
    // Define scales
    const yScale = d3.scaleBand()
    .domain(["KAST", "KPR", "Headshot%", "Impact", "Rating"])
    .range([MARGIN.top, Height-MARGIN.bottom-MARGIN.top]);
  
    // Define individual x scales for each statistic
    var startingPoint = [60.4, 0.38, 8.3, 0.56, 0.72];

    const xScales = [
      d3.scaleLinear().domain([startingPoint[0], 81.6]).range([0, Width]), // KAST
      d3.scaleLinear().domain([startingPoint[1], 1.015]).range([0, Width]), // KPR
      d3.scaleLinear().domain([startingPoint[2], 74.75]).range([0, Width]), // HeadShot %
      d3.scaleLinear().domain([startingPoint[3], 1.67]).range([0, Width]), // Impact
      d3.scaleLinear().domain([startingPoint[4], 1.468]).range([0, Width]), // Rating
    ];
  
    // Define variables to hold tooltip elements
    let hoverBox = svg.append("rect")
    .attr("class", "tooltip-box")
    .attr("width", 120)
    .attr("height", 25)
    .attr("rx", 10) // Rounded corners
    .attr("ry", 10)
    .style("fill", "black") // Black background color
    .style("opacity", 0.8) // Adjust opacity
    .style("stroke", "white") // White border
    .style("stroke-width", 1.5) // Border width
    .style("filter", "drop-shadow(0 0 5px rgba(0,0,0,0.5))") // Add a drop shadow
    .style("display", "none");
    
    let rectHoverBox = svg.append("rect")
    .attr("class", "tooltip-box")
    .attr("width", 100)
    .attr("height", 60)
    .attr("rx", 10) // Rounded corners
    .attr("ry", 10)
    .style("fill", "black") // Black background color
    .style("opacity", 0.8) // Adjust opacity
    .style("stroke", "white") // White border
    .style("stroke-width", 1.5) // Border width
    .style("filter", "drop-shadow(0 0 5px rgba(0,0,0,0.5))") // Add a drop shadow
    .style("display", "none");

    let hoverText = svg.append("text")
    .attr("class", "tooltip")
    .style("display", "none")
    .style("font-size", "12px") // Adjust font size
    .style("font-family", "Arial")
    .style("fill", "white")
    .style("pointer-events", "none");

    // Draw box plots
    if (boxCount == 0) {
      for (let i = 0; i < Max.length; i++) {
        const boxHeight = 20;
    
        // Draw horizontal line
        svg
          .append("line")
          .attr("x1", xScales[i](Min[i]))
          .attr("x2", xScales[i](Max[i]))
          .attr("y1", yScale("KAST") + i * yScale.bandwidth())
          .attr("y2", yScale("KAST") + i * yScale.bandwidth())
          .attr("stroke", "white");
    
        // Draw box
        svg
          .append("rect")
          .attr("class", "graph")
          .attr("x", xScales[i](Quart1st[i]))
          .attr("y", yScale("KAST") + i * yScale.bandwidth() - boxHeight / 2)
          .attr("width", xScales[i](Quart3rd[i]) - xScales[i](Quart1st[i]))
          .attr("height", boxHeight)
          .attr("stroke", "white")
          .style("fill", "#69b3a2")
          .style("fill-opacity", 0.5)
          .on("mouseover", function (event) {
          const [x, y] = d3.pointer(event);
  
          // Position the tooltip relative to the chart rather than the mouse cursor
          var hoverX = x - 50; // Adjust the offset as needed
          var hoverY = y + 20; // Adjust the offset as needed
  
          // Show tooltip for the box on hover
          rectHoverBox
              .attr("x", hoverX)
              .attr("y", hoverY - 10); // Adjust the offset as needed
  
          hoverText
              .attr("x", hoverX + 5)
              .attr("y", hoverY + 10); // Adjust the offset as needed
  
              // Split the tooltip text into two lines using <tspan>
              hoverText.text(`Q1: ${parseFloat(Quart1st[i]).toFixed(2)}`);
              hoverText.append("tspan")
              .attr("x", hoverX + 5)
              .attr("dy", "1.2em") // Line spacing
              .text(`Mean: ${parseFloat(Mean[i]).toFixed(2)}`);
              hoverText.append("tspan")
              .attr("x", hoverX + 5)
              .attr("dy", "1.2em") // Line spacing
              .text(`Q3: ${parseFloat(Quart3rd).toFixed(2)}`);
              rectHoverBox.style("display", "block");
              hoverText.style("display", "block");
          })
          .on("mouseout", function () {
              // Hide the tooltip elements on mouseout
              rectHoverBox.style("display", "none");
              hoverText.style("display", "none");
          });
    
        // Draw median line
        svg
          .append("line")
          .attr("x1", xScales[i](Mean[i]))
          .attr("x2", xScales[i](Mean[i]))
          .attr("y1", yScale("KAST") + i * yScale.bandwidth() - boxHeight / 2)
          .attr("y2", yScale("KAST") + i * yScale.bandwidth() + boxHeight / 2)
          .attr("stroke", "white");

        // Draw min line
        svg
          .append("line")
          .attr("x1", xScales[i](Min[i]))
          .attr("x2", xScales[i](Min[i]))
          .attr("y1", yScale("KAST") + i * yScale.bandwidth() - boxHeight / 2 + 3)
          .attr("y2", yScale("KAST") + i * yScale.bandwidth() + boxHeight / 2 - 4)
          .attr("stroke", "white");

        // Draw max line
        svg
          .append("line")
          .attr("x1", xScales[i](Max[i]))
          .attr("x2", xScales[i](Max[i]))
          .attr("y1", yScale("KAST") + i * yScale.bandwidth() - boxHeight / 2 + 3)
          .attr("y2", yScale("KAST") + i * yScale.bandwidth() + boxHeight / 2 - 4)
          .attr("stroke", "white");
    
        //max, min, and label
        svg.append("text")
          .attr("x", xScales[i](Max[i]))
          .attr("y", yScale("KAST") + i * yScale.bandwidth() + 20)
          .attr("fill", "white")
          .attr("text-anchor", "middle")
          .text(formatLabel(Max[i]));
    
        svg.append("text")
          .attr("x", xScales[i](Min[i]))
          .attr("y", yScale("KAST") + i * yScale.bandwidth() + 20)
          .attr("fill", "white")
          .attr("text-anchor", "middle")
          .text(formatLabel(Min[i]));

        svg.append("text")
          .attr("x", 45)
          .attr("y", yScale("KAST") + i * yScale.bandwidth() + 6)
          .attr("fill", "white")
          .attr("text-anchor", "middle")
          .text(criteria[i]);

        boxCount++;
      }
    }
    // Draw dots for each player data point
    var Player = Teams.get(teamName).Players.get(playerName);
    var playerStatusMap = makePlayerStatus(Player);
    var playerStatus = Array.from(playerStatusMap.entries());

    for (let i = 0; i < playerStatus.length; i++) {
        const [statistic, value] = playerStatus[i];
        // Calculate x-position based on the player's statistic
        const xPosition = xScales[i](value);
      
        // Calculate y-position based on the player's category (KAST, KPR, Headshot%, Impact, Rating)
        const yPosition = yScale(statistic) - 28;
        // Draw a dot
        if (i == 0){
          if(!dot1){
            dot1 = svg.append("circle")
            .attr("cx", xPosition)
            .attr("cy", yPosition + yScale.bandwidth() / 2)
            .attr("r", 5)
            .style("fill", " red")
            .style("fill-opacity", 0.9)
          }
          dot1.transition()
          .duration(1000)
          .delay(function(d,i){
              return i * 50;
          })
          .attr("cx", xPosition)
          .attr("cy", yPosition + yScale.bandwidth() / 2)
          .attr("r", 5)
          .style("fill", " red")
          .style("fill-opacity", 0.9);

          dot1.on("mouseover", function (event, d) {
            d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 9); 
            const [x, y] = d3.pointer(event);

            // Position the tooltip relative to the chart rather than the mouse cursor
            var hoverX = x - 50; // Adjust the offset as needed
            var hoverY = y + 20; // Adjust the offset as needed

            hoverBox
                .attr("x", hoverX)
                .attr("y", hoverY);

            hoverText
                .attr("x", hoverX + 5)
                .attr("y", hoverY + 15)

            // Split the tooltip text into two lines using <tspan>
            hoverText.text(`${statistic}: ${parseFloat(value).toFixed(2)}`);
            hoverBox.style("display", "block");
            hoverText.style("display", "block");
        })
        .on("mouseout", function () {
            d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 5); // Restore circle size on mouseout
            // Hide the tooltip elements on mouseout
            hoverBox.style("display", "none");
            hoverText.style("display", "none");
        });
        }
        else if (i == 1) {
          if(!dot2){
            dot2 = svg.append("circle")
            .attr("cx", xPosition)
            .attr("cy", yPosition + yScale.bandwidth() / 2)
            .attr("r", 5)
            .style("fill", " red")
            .style("fill-opacity", 0.9)
          }
          dot2.transition()
          .duration(1000)
          .delay(function(d,i){
              return i * 50;
          })
          .attr("cx", xPosition)
          .attr("cy", yPosition + yScale.bandwidth() / 2)
          .attr("r", 5)
          .style("fill", " red")
          .style("fill-opacity", 0.9);

          dot2.on("mouseover", function (event, d) {
            d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 9); 
            const [x, y] = d3.pointer(event);

            // Position the tooltip relative to the chart rather than the mouse cursor
            var hoverX = x - 50; // Adjust the offset as needed
            var hoverY = y + 20; // Adjust the offset as needed

            hoverBox
                .attr("x", hoverX)
                .attr("y", hoverY);

            hoverText
                .attr("x", hoverX + 5)
                .attr("y", hoverY + 15)

            // Split the tooltip text into two lines using <tspan>
            hoverText.text(`${statistic}: ${parseFloat(value).toFixed(2)}`);
            hoverBox.style("display", "block");
            hoverText.style("display", "block");
        })
        .on("mouseout", function () {
            d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 5); // Restore circle size on mouseout
            // Hide the tooltip elements on mouseout
            hoverBox.style("display", "none");
            hoverText.style("display", "none");
        });
        }
        else if (i == 2) {
          if(!dot3){
            dot3 = svg.append("circle")
            .attr("cx", xPosition)
            .attr("cy", yPosition + yScale.bandwidth() / 2)
            .attr("r", 5)
            .style("fill", " red")
            .style("fill-opacity", 0.9)
          }
          dot3.transition()
          .duration(1000)
          .delay(function(d,i){
              return i * 50;
          })
          .attr("cx", xPosition)
          .attr("cy", yPosition + yScale.bandwidth() / 2)
          .attr("r", 5)
          .style("fill", " red")
          .style("fill-opacity", 0.9);

          dot3.on("mouseover", function (event, d) {
            d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 9); 
            const [x, y] = d3.pointer(event);

            // Position the tooltip relative to the chart rather than the mouse cursor
            var hoverX = x - 50; // Adjust the offset as needed
            var hoverY = y + 20; // Adjust the offset as needed

            hoverBox
                .attr("x", hoverX)
                .attr("y", hoverY);

            hoverText
                .attr("x", hoverX + 5)
                .attr("y", hoverY + 15)

            // Split the tooltip text into two lines using <tspan>
            hoverText.text(`${statistic}: ${parseFloat(value).toFixed(2)}`);
            hoverBox.style("display", "block");
            hoverText.style("display", "block");
        })
        .on("mouseout", function () {
            d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 5); // Restore circle size on mouseout
            // Hide the tooltip elements on mouseout
            hoverBox.style("display", "none");
            hoverText.style("display", "none");
        });
        }
        else if (i == 3) {
          if(!dot4){
            dot4 = svg.append("circle")
            .attr("cx", xPosition)
            .attr("cy", yPosition + yScale.bandwidth() / 2)
            .attr("r", 5)
            .style("fill", " red")
            .style("fill-opacity", 0.9)
          }
          dot4.transition()
          .duration(1000)
          .delay(function(d,i){
              return i * 50;
          })
          .attr("cx", xPosition)
          .attr("cy", yPosition + yScale.bandwidth() / 2)
          .attr("r", 5)
          .style("fill", " red")
          .style("fill-opacity", 0.9);

          dot4.on("mouseover", function (event, d) {
            d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 9); 
            const [x, y] = d3.pointer(event);

            // Position the tooltip relative to the chart rather than the mouse cursor
            var hoverX = x - 50; // Adjust the offset as needed
            var hoverY = y + 20; // Adjust the offset as needed

            hoverBox
                .attr("x", hoverX)
                .attr("y", hoverY);

            hoverText
                .attr("x", hoverX + 5)
                .attr("y", hoverY + 15)

            // Split the tooltip text into two lines using <tspan>
            hoverText.text(`${statistic}: ${parseFloat(value).toFixed(2)}`);
            hoverBox.style("display", "block");
            hoverText.style("display", "block");
        })
        .on("mouseout", function () {
            d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 5); // Restore circle size on mouseout
            // Hide the tooltip elements on mouseout
            hoverBox.style("display", "none");
            hoverText.style("display", "none");
        });
        }
        else if (i == 4) {
          if(!dot5){
            dot5 = svg.append("circle")
            .attr("cx", xPosition)
            .attr("cy", yPosition + yScale.bandwidth() / 2)
            .attr("r", 5)
            .style("fill", " red")
            .style("fill-opacity", 0.9)
          }
          dot5.transition()
          .duration(1000)
          .delay(function(d,i){
              return i * 50;
          })
          .attr("cx", xPosition)
          .attr("cy", yPosition + yScale.bandwidth() / 2)
          .attr("r", 5)
          .style("fill", " red")
          .style("fill-opacity", 0.9);

          dot5.on("mouseover", function (event, d) {
            d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 9); 
            const [x, y] = d3.pointer(event);

            // Position the tooltip relative to the chart rather than the mouse cursor
            var hoverX = x - 50; // Adjust the offset as needed
            var hoverY = y + 20; // Adjust the offset as needed

            hoverBox
                .attr("x", hoverX)
                .attr("y", hoverY);

            hoverText
                .attr("x", hoverX + 5)
                .attr("y", hoverY + 15)

            // Split the tooltip text into two lines using <tspan>
            hoverText.text(`${statistic}: ${parseFloat(value).toFixed(2)}`);
            hoverBox.style("display", "block");
            hoverText.style("display", "block");
        })
        .on("mouseout", function () {
            d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 5); // Restore circle size on mouseout
            // Hide the tooltip elements on mouseout
            hoverBox.style("display", "none");
            hoverText.style("display", "none");
        });
        }
    }
}

function drawLineGraph(playerName, teamName) {
    // if is rating is NA map to 0 but hover text box says something that they didn't make it
    // If all team member is Na then show all zero, but have a text box show they didn't make it in any of the game
    d3.select("#lineGraph").selectAll(".Axis").remove();

  const svg = d3.select('#lineGraph');

  // Define a color scale
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    var maxRating = max(Teams.get(teamName).Players);
    if (maxRating == 0){
      maxRating = 0.5;
    }

    const yScale = d3.scaleLinear()
    .domain([0.0, maxRating])
    .range([Height - 60, 20.0]);

  const xScale = d3.scaleBand()
  .domain(tournamentName)
  .range([80, BWidth]);

  const lineGenerator = d3.line()
  .x(d => xScale(d.tournamentName))
  .y(d => yScale(isNaN(d.rating) ? 0 : d.rating));

  const chart = svg.append('g');

  // Draw x-axis
  chart.append('g')
  .attr('class', 'Axis')
  .attr('transform', `translate(0, ${Height - 50})`)
  .call(d3.axisBottom(xScale));

    // Draw y-axis
    chart.append('g')
    .attr('class', 'Axis')
    .attr('transform', `translate(110, 0)`)
    .call(d3.axisLeft(yScale));

    // Add y-axis label
    svg.append('text')
    .attr('class', 'Axis')
    .attr('transform', 'rotate(-90)')
    .attr('y', MARGIN.left / 2)
    .attr('x', 20 - Height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .style('fill', 'white')
    .style('stroke', 'white')
    .text('Rating');
    
    // loop over each player and draw their tournament Rating
    var playerList = Teams.get(teamName).Players;
    let count = 0;
    playerList.forEach((player, Name) => {

      var tournamentRatings = Array.from(player.tournamentRating).map(entry => {
          return { tournamentName: entry[0], rating: entry[1] };
      })
      // if Line 1 doesn't exist, create one else update
      if (count == 0){
        if (!line1){
          line1 = svg.append('path')
          .data([tournamentRatings])
          .attr('class', 'line')
          .attr('transform', `translate(78, 0)`)
          .attr('stroke', colorScale(Name))
          .style("stroke-width", 3)
          .attr('fill', 'none')
          .attr('d', lineGenerator);
        }
        line1.data([tournamentRatings])
        .transition()
        .duration(1000)
        .delay(function(d,i){
            return i * 50;
        })
        .attr("d", lineGenerator);
      }
      else if (count == 1){
        if (!line2){
          line2 = svg.append('path')
          .data([tournamentRatings])
          .attr('class', 'line')
          .attr('transform', `translate(78, 0)`)
          .attr('stroke', colorScale(Name))
          .style("stroke-width", 3)
          .attr('fill', 'none')
          .attr('d', lineGenerator);
        }
        line2.data([tournamentRatings])
        .transition()
        .duration(1000)
        .delay(function(d,i){
            return i * 50;
        })
        .attr("d", lineGenerator);
      }
      else if (count == 2){
        if (!line3){
          line3 = svg.append('path')
          .data([tournamentRatings])
          .attr('class', 'line')
          .attr('transform', `translate(78, 0)`)
          .attr('stroke', colorScale(Name))
          .style("stroke-width", 3)
          .attr('fill', 'none')
          .attr('d', lineGenerator);
        }
        line3.data([tournamentRatings])
        .transition()
        .duration(1000)
        .delay(function(d,i){
            return i * 50;
        })
        .attr("d", lineGenerator);
      }
      else if (count == 3){
        if (!line4){
          line4 = svg.append('path')
          .data([tournamentRatings])
          .attr('class', 'line')
          .attr('transform', `translate(78, 0)`)
          .attr('stroke', colorScale(Name))
          .style("stroke-width", 3)
          .attr('fill', 'none')
          .attr('d', lineGenerator);
        }
        line4.data([tournamentRatings])
        .transition()
        .duration(1000)
        .delay(function(d,i){
            return i * 50;
        })
        .attr("d", lineGenerator);
      }
      else if (count == 4){
        if (!line5){
          line5 = svg.append('path')
          .data([tournamentRatings])
          .attr('class', 'line')
          .attr('transform', `translate(78, 0)`)
          .attr('stroke', colorScale(Name))
          .style("stroke-width", 3)
          .attr('fill', 'none')
          .attr('d', lineGenerator);
        }
        line5.data([tournamentRatings])
        .transition()
        .duration(1000)
        .delay(function(d,i){
            return i * 50;
        })
        .attr("d", lineGenerator);
      }
      count++;
    }) 

  // Add a vertical line that follows the mouse
  const tracker = svg.append('line')
    .attr('class', 'tracker')
    .attr('y1', 0)
    .attr('y2', Height - 50)
    .attr('stroke', 'grey')
    .attr('stroke-width', 2)
    .attr('pointer-events', 'none')
    .attr('opacity', 0); 

    const textBox = svg.append('text')
    .attr('class', 'tracker-text')
    .attr('transform', 'translate(80, 10)')
    .style("font-family", "Arial")
    .style("fill", "white")
    .style('font-size', '12px');

    const overlayRect = svg.append('rect')
    .attr('width', BWidth - 80)
    .attr('height', Height - 50)
    .attr('transform', 'translate(80, 0)')
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .on('mousemove', mousemove)
    .on('mouseout', () => {
      tracker.style('opacity', 0);
      textBox.style('opacity', 0);
    });

  function mousemove(event) {
    const mouseX = d3.pointer(event)[0];

    // Check if the mouse is within the graph boundaries else hide tracker
    if (mouseX >= 80 && mouseX <= BWidth) {
      // Calculate the nearest data point based on the mouse position
      const index = Math.round((mouseX - 20) / (BWidth - 80) * (tournamentName.length - 1));

      // Ensure the index is within the valid range
      const validIndex = Math.max(0, Math.min(index, tournamentName.length - 1));

      // Get the center of the band for the corresponding value from your data
      const snappedX = xScale(tournamentName[validIndex]) + xScale.bandwidth() / 2;

      // Update the position of the vertical line
      tracker.attr('x1', snappedX)
        .attr('x2', snappedX)
        .style('opacity', 1);

      // Clear previous text content
      textBox.text('');
      textBox.style('opacity', 1);

      let textY = 40;
      if (validIndex == 5){
        textBox.append('tspan')
        .attr('x', snappedX - 170)
        .attr('y', textY - 20)
        .text(tournamentName[validIndex]);
      }else {
        textBox.append('tspan')
        .attr('x', snappedX - 70)
        .attr('y', textY - 20)
        .text(tournamentName[validIndex]);
      }
      // Loop through each player and display their respective ratings
      playerList.forEach((player, Name) => {
        const rating = player.tournamentRating.get(tournamentName[validIndex]);
        if (validIndex == 5){
          textBox.append('tspan')
          .attr('x', snappedX - 170)
          .attr('y', textY)
          .text(`${Name}: ${isNaN(rating) ? "Did not play": rating}`)
          textY += 20;
        }
        else{
          textBox.append('tspan')
          .attr('x', snappedX - 70)
          .attr('y', textY)
          .text(`${Name}: ${isNaN(rating) ? "Did not play": rating}`)
          textY += 20;
        }
      });
    } else {
      tracker.style('opacity', 0);
    }
  }
}

function max(Players) {
  let max = 0.0;
  Players.forEach((player, Name) => {

    var tournamentRatings = Array.from(player.tournamentRating).map(entry => {
      return { tournamentName: entry[0], rating: entry[1] };
    })
    for (let i = 0; i < tournamentRatings.length; i++){
      if (isNaN(tournamentRatings[i]["rating"]) == false){
        if (max < tournamentRatings[i]["rating"]){
          max = tournamentRatings[i]["rating"];
        }
      }
    }
  })
  return max;
}
// Add the player and Team data into the 30 Teams array that created in the very top
function makeData() {
    fetchJSONFile('Data/TeamMapWinRate.json', function(mapWinRates) {
      for(const winRate of mapWinRates){
        let Team = Teams.get(winRate["TeamName"]);
        let mapData = Team.MapsWinRate;
        mapData.set("Inferno", winRate["Inferno (win%)"]);
        mapData.set("Mirage", winRate["Mirage (win%)"]);
        mapData.set("Nuke", winRate["Nuke (win%)"]);
        mapData.set("Anubis", winRate["Anubis (win%)"]);
        mapData.set("Overpass", winRate["Overpass (win%)"]);
        mapData.set("Vertigo", winRate["Vertigo (win%)"]);
        mapData.set("Ancient", winRate["Ancient (win%)"]);
      }
    });
    
    fetchJSONFile('Data/PlayersStatus.json', function(players) {
      for (const player of players) {
        let Team = Teams.get(player["TeamName"]);
        let playerData = Team.Players;
        playerData.set(player["Name"], new Player(player["Name"], player["Rating 2.0"], player["Headshot %"],
        player["KPR (kill per round)"], player["KAST %"], player["Impact"]));
      }
    });
    
    fetchJSONFile('Data/PlayerPosition.json', function(positions) {
      for (const pos of positions) {
        let Team = Teams.get(pos["Team"]);
        let playerPos = Team.PlayerPositions;
        playerPos.set("Awper", pos["Awper"]);
        playerPos.set("IGL", pos["IGL"]);
        playerPos.set("firstRated", pos["1st Rated"]);
        playerPos.set("secondRated", pos["2nd Rated"]);
        playerPos.set("thirdRated", pos["3rd Rated"]);
      }
    });
    for(let i = 0; i < 1000000; i++){
        if (i == 999999){
            loadedTourment();
        }
    }
}
function loadedTourment(){
    fetchJSONFile('Data/TournamentStats.json', function (tournaments) {
        for (const tournament of tournaments){
          playerToTeam.set(tournament["Name"], tournament["TeamName"]);
          Teams.get(tournament["TeamName"]).Players.get(tournament["Name"]).tournamentRating.set("BLAST Premier Spring Final", tournament["BLAST Premier Spring Final"]);
          Teams.get(tournament["TeamName"]).Players.get(tournament["Name"]).tournamentRating.set("BLAST Premier Fall Groups", tournament["BLAST Premier Fall Groups"]);
          Teams.get(tournament["TeamName"]).Players.get(tournament["Name"]).tournamentRating.set("IEM Cologne 2023", tournament["IEM Cologne 2023"]);
          Teams.get(tournament["TeamName"]).Players.get(tournament["Name"]).tournamentRating.set("Gamers8 2023", tournament["Gamers8 2023"]);
          Teams.get(tournament["TeamName"]).Players.get(tournament["Name"]).tournamentRating.set("ESL Pro League Season 18", tournament["ESL Pro League Season 18"]);
          Teams.get(tournament["TeamName"]).Players.get(tournament["Name"]).tournamentRating.set("IEM Sydney 2023", tournament["IEM Sydney 2023"]);
        }
    });
    setup();
}
// fetch function that parse json to array
function fetchJSONFile (path, callback){
const httpRequest = new XMLHttpRequest();
httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
    if (httpRequest.status === 200) {
        const data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
    }
    }
};
httpRequest.open('GET', path);
httpRequest.send();
}

function makePlayerStatus(Player){
  var status = new Map([
      ["KAST", 0],
      ["KPR", 0],
      ["Headshot%", 0],
      ["Impact", 0],
      ["Rating", 0],
  ]);
  status.set("KAST", Player.playerKAST);
  status.set("KPR", Player.playerKPR);
  status.set("Headshot%", Player.playerHeadshot);
  status.set("Impact", Player.playerImpact);
  status.set("Rating", Player.playerRating);

  return status;
}