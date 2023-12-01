class VIEW{
    constructor(){
    }

    // this function will be use to clear the drawing board (svg)
    reset(svg){      
        svg.selectAll(".Axis").remove();
        svg.select(".bar-chart").remove();
        svg.select(".scatter-plot").remove();
        svg.select(".radarWrapper").remove();
    }

    // draw the bar graph for HLTV and Valve ranking
    rankBarGraph(svg, criteria){
      const xScale = d3.scalePoint()
      .domain(RANKING)
      .range([MARGIN.left, Width - MARGIN.right]);
    
      const yScale = d3.scalePoint()
      .domain(ALLTEAMNAME)
      .range([0, Height]);

      svg.append("g")
      .attr("class", "Axis")
      .attr("transform", function () {
      return `translate(30, ${MARGIN.top -2})`
      })
      .call(d3.axisTop(xScale));
  
      svg.append("g")
      .attr("class", "Axis")
      .attr("transform", function () {
      return `translate(${MARGIN.left -2}, ${MARGIN.top})`
      })
      .call(d3.axisLeft(yScale));
  
      let Rank = Array.from(Teams.values()).map(team => ({
          Name: team.Name,
          [criteria]: team[criteria],
          Region: team.Region,
          Country: team.Country,
      }));
      let teamOne = d3.select("#pickTeamOne").node().value;
      let teamTwo = d3.select("#pickTeamTwo").node().value;
      var teamOneScoreText = document.getElementById('teamOneScore');
      var teamTwoScoreText = document.getElementById('teamTwoScore');
      let winner = teamOne;
      if (Teams.get(teamOne)[criteria] > Teams.get(teamTwo)[criteria]){
        winner = teamTwo;
        winnerList[count] = 2;
        teamTwoScore++;
      }else{
        winnerList[count] = 1;
        teamOneScore++;
      }
      teamTwoScoreText.textContent = "SCORE " + teamTwoScore;
      teamOneScoreText.textContent = "SCORE " + teamOneScore;
      winnerText.textContent = winner.toUpperCase() + " is the higher ranked team";

      let bars = svg.append("g")
      .attr("class", "bar-chart");
      
      bars.selectAll(".bar")
      .data(Rank)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 100)
      .attr("y", d => (yScale(d.Name) + MARGIN.top))
      .attr("height", 15)
      .on("mousemove", function (event, d) {
      const [x, y] = d3.pointer(event);
      
      // Position the tooltip relative to the chart rather than the mouse cursor
      var hoverX = x - 100; // Adjust the offset as needed
      var hoverY = y - 60; // Adjust the offset as needed

      if(hoverY < MARGIN.top + 2)
      {
        hoverY = hoverY + 75;
      }
      
      hoverBox
        .attr("x", hoverX)
        .attr("y", hoverY - 9)
      
      hoverText
        .attr("x", hoverX + 5)
        .attr("y", hoverY + 7)
  
      // Split the tooltip text into two lines using <tspan>
      hoverText.text(`Name: ${d.Name}`);
      hoverText.append("tspan")
        .attr("x", hoverX + 5)
        .attr("dy", "1.2em") // Line spacing
        .text(`Weeks in top 30: ${d[criteria]}`);
      hoverText.append("tspan")
        .attr("x", hoverX + 5)
        .attr("dy", "1.2em") // Line spacing
        .text(`Region: ${d.Region}`);
      hoverText.append("tspan")
        .attr("x", hoverX + 5)
        .attr("dy", "1.2em") // Line spacing
        .text(`Country: ${d.Country}`);
      
      hoverBox.style("display", "block");
      hoverText.style("display", "block");
      })
      .on("mouseout", function () {
      // Hide the tooltip elements on mouseout
      hoverBox.style("display", "none");
      hoverText.style("display", "none");
      })
      .attr("fill", d => {
      // left with update the box color
      if(d.Name === teamOne){
          return "blue"
      }else if (d.Name === teamTwo){
          return "orange"
      }else
          return "#444"
      })
      .attr("width", 0)
      .transition()
      .duration(1000)
      .delay(function(d,i){
      return i * 50;
      })
      .attr("width", d => (xScale(d[criteria]) - MARGIN.right - 20));
  
        // Define variables to hold tooltip elements
      let hoverBox = svg.append("rect")
      .attr("class", "tooltip-box")
      .attr("width", 200)
      .attr("height", 65)
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
    }

    // draw the tug-of-war graph for map win rates
    mapWinRates(svg, criteria) {
      const mapNames = ["Inferno", "Mirage", "Nuke", "Anubis", "Overpass", "Vertigo", "Ancient"];
      const barWidth = 20;
      
      const yScale = d3.scaleBand()
      .domain(mapNames)
      .range([MARGIN.top + barWidth, Height - MARGIN.bottom])
      .padding(0.1); // Adjust padding as needed
      
      const xScale = d3.scaleLinear()
      .domain([0, 100]) // Adjust the domain according to your data
      .range([MARGIN.left, Width - MARGIN.right - 40]); // Adjust the range accordingly
    
      svg.append("g")
      .attr("class", "Axis")
      .attr("transform", function () {
        return `translate(${MARGIN.left-1.5}, 0)`;
      })
      .call(d3.axisLeft(yScale));
  
      svg.append("g")
      .attr("class", "Axis")
      .attr("transform", function () {
        return `translate(${Width - MARGIN.right -40}, 0)`;
      })
      .call(d3.axisRight(yScale));
  
      svg.append("g")
      .attr("class", "Axis")
      .attr("transform", function () {
        return `translate(${MARGIN.left - 100}, ${Height+ 100})`;
      })
      .call(d3.axisBottom(xScale));
              
      let teamOne = d3.select("#pickTeamOne").node().value;
      let teamTwo = d3.select("#pickTeamTwo").node().value;

      let teamOneCount = 0;
      let teamTwoCount = 0;

      // Calculate which team has the higher map percentages
      for (let mapName of mapNames) {
        if (Teams.get(teamOne)[criteria].get(mapName) === "BAN" || Teams.get(teamTwo)[criteria].get(mapName) === "BAN") {
            continue;
        } else if (Teams.get(teamOne)[criteria].get(mapName) == Teams.get(teamTwo)[criteria].get(mapName)) {
          if (Teams.get(teamOne)["HLTV"] < Teams.get(teamTwo)["HLTV"]){
            teamOneCount++;
          }else{
            teamTwoCount++;
          }
        } else if (Teams.get(teamOne)[criteria].get(mapName) > Teams.get(teamTwo)[criteria].get(mapName)) {
            teamOneCount++;
        } else {
            teamTwoCount++;
        }
      }

      // Decide winner
      let winner = teamOne;
      if (teamOneCount < teamTwoCount) {
        winner = teamTwo;
        winnerList[count] = 2;
        teamTwoScore++;
      } else {
        winnerList[count] = 1;
        teamOneScore++;
      }
      
      let teamTwoScoreText = document.getElementById('teamTwoScore');
      let teamOneScoreText = document.getElementById('teamOneScore');
      let winnerText = document.getElementById('winnerText');

      teamTwoScoreText.textContent = "SCORE " + teamTwoScore;
      teamOneScoreText.textContent = "SCORE " + teamOneScore;
      winnerText.textContent = winner.toUpperCase() + " has the higher map win rate";  

      // call helper method buildMapData to make the array of the map
      const teamOneMapWinRates = this.buildMapData(Teams.get(teamOne)[criteria], mapNames);
      const teamTwoMapWinRates = this.buildMapData(Teams.get(teamTwo)[criteria], mapNames);

      var difference = this.calculateWinRateDifference(teamOneMapWinRates, teamTwoMapWinRates);
      var difference2 = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
      for (let i = 0; i < difference.length; i++) {
        difference2[i] = difference[i] * -1;
      };

      let bars = svg.append("g")
      .attr("class", "bar-chart");
  
      // Draw bars for Team 1
      bars.selectAll(".teamOneBars")
      .data(difference)
      .enter()
      .append("rect")
      .attr("class", "teamOneBars")
      .attr("x", (d) => {
          if (isNaN(d)) {
              return MARGIN.left;
          }
          if (d < 0){
            d *= -1
          }
          return xScale(Math.min(0, d));
      })
      .attr("y", (d, i) => {
          if (isNaN(d)) {
              return yScale(mapNames[i]) - yScale.bandwidth() / 4 + 25;
          }
          return yScale(mapNames[i]) - yScale.bandwidth() / 4 + 25;
      })
      .on("mousemove", function (event, d) {
      const [x, y] = d3.pointer(event);
      
      // Position the tooltip relative to the chart rather than the mouse cursor
      var hoverX = 0; // Adjust the offset as needed
      var hoverY = y - 30; // Adjust the offset as needed
      var hoverX2 = Width - MARGIN.right - MARGIN.left;
      if(hoverY < MARGIN.top + 2)
      {
        hoverY = hoverY + 75;
      }
      
      hoverBox
        .attr("x", hoverX)
        .attr("y", hoverY - 9)
      
      hoverText
        .attr("x", hoverX + 5)
        .attr("y", hoverY + 7)
  
      hoverBox2
        .attr("x", hoverX2)
        .attr("y", hoverY - 9)
      
      hoverText2
        .attr("x", hoverX2 + 5)
        .attr("y", hoverY + 7)

      let pointer = 0;
      if (y > 100 && y < 150){
        pointer = 1
      } else if (y > 150 && y < 210){
        pointer = 2;
      } else if (y > 220 && y < 260){
        pointer = 3;
      } else if (y > 280 && y < 310){
        pointer = 4;
      } else if (y > 320 && y < 370){
        pointer = 5;
      } else if (y > 380 && y < 420){
        pointer = 6;
      }
      // Split the tooltip text into two lines using <tspan>
      hoverText.text(`Name: ${teamOne}`);
      hoverText.append("tspan")
        .attr("x", hoverX + 5)
        .attr("dy", "1.2em") // Line spacing
        .text(`Map: ${mapNames[pointer]}`);
      hoverText.append("tspan")
        .attr("x", hoverX + 5)
        .attr("dy", "1.2em") // Line spacing
        .text(function () {
          if (Teams.get(teamOne)[criteria].get(mapNames[pointer]) === "BAN" && Teams.get(teamTwo)[criteria].get(mapNames[pointer]) === "BAN"){
            return "Ban by both team";
          }
          else if (Teams.get(teamOne)[criteria].get(mapNames[pointer]) === "BAN")
            return "Ban by " + teamOne;
          else if (Teams.get(teamTwo)[criteria].get(mapNames[pointer]) === "BAN")
            return "Ban by " + teamTwo;
          else
            return `WinRate: ${parseFloat(50+difference[pointer]).toFixed(2)}%`;
        });
      
        // .text(`WinRate: ${parseFloat(50+difference[pointer]).toFixed(2)}%`);
      hoverText2.text(`Name: ${teamTwo}`);
      hoverText2.append("tspan")
        .attr("x", hoverX2 + 5)
        .attr("dy", "1.2em") // Line spacing
        .text(`Map: ${mapNames[pointer]}`);
      hoverText2.append("tspan")
        .attr("x", hoverX2 + 5)
        .attr("dy", "1.2em") // Line spacing
        .text(function () {
          if (Teams.get(teamOne)[criteria].get(mapNames[pointer]) === "BAN" && Teams.get(teamTwo)[criteria].get(mapNames[pointer]) === "BAN"){
            return "BAN by both team";
          }
          else if (Teams.get(teamOne)[criteria].get(mapNames[pointer]) === "BAN")
            return "BAN by " + teamOne;
          else if (Teams.get(teamTwo)[criteria].get(mapNames[pointer]) === "BAN")
            return "BAN by " + teamTwo;
          else
            return `WinRate: ${parseFloat(50+difference2[pointer]).toFixed(2)}%`;
        });
      
      hoverBox.style("display", "block");
      hoverText.style("display", "block");
      hoverBox2.style("display", "block");
      hoverText2.style("display", "block");
      })
      .on("mouseout", function () {
      // Hide the tooltip elements on mouseout
      hoverBox.style("display", "none");
      hoverText.style("display", "none");
      hoverBox2.style("display", "none");
      hoverText2.style("display", "none");
      })
      .attr("fill", d => {
      // left with update the box color
      if(d.Name === teamOne){
          return "steelblue"
      }else if (d.Name === teamTwo){
          return "orange"
      }else
          return "gray"
      })
      .attr("width", 0)
      .transition()
      .duration(1000)
      .delay(function(d,i){
      return i * 50;
      })
      .attr("width", (d) => {
          if (isNaN(d)) {
            return xScale(0); // or any other small positive value
          }
          return Math.abs(xScale(50+d) - xScale(0));
      })
      .attr("height", yScale.bandwidth() / 2)
      .attr("fill", (d) => (isNaN(d)) ? "gray" : "steelblue");

      // Draw bars for Team 2
      bars.selectAll(".teamTwoBars")
      .data(difference2)
      .enter()
      .append("rect")
      .attr("class", "teamTwoBars")
      .attr("x", (d) => {
          if (isNaN(d)) {
              return xScale(0);
          }
          return xScale(Math.max(0, 50-d));
      })
      .attr("y", (d, i) => {
          if (isNaN(d)) {
              return yScale(mapNames[i]) - yScale.bandwidth() / 4 + 25;
          }
          return yScale(mapNames[i]) - yScale.bandwidth() / 4 + 25;
      })
      .attr("height", yScale.bandwidth() / 2)
      .on("mousemove", function (event, d) {
        const [x, y] = d3.pointer(event);
        
        // Position the tooltip relative to the chart rather than the mouse cursor
        var hoverX = 0; // Adjust the offset as needed
        var hoverY = y - 30; // Adjust the offset as needed
        var hoverX2 = Width - MARGIN.right - MARGIN.left;
        if(hoverY < MARGIN.top + 2)
        {
          hoverY = hoverY + 75;
        }
        
        hoverBox
          .attr("x", hoverX)
          .attr("y", hoverY - 9)
        
        hoverText
          .attr("x", hoverX + 5)
          .attr("y", hoverY + 7)
    
        hoverBox2
          .attr("x", hoverX2)
          .attr("y", hoverY - 9)
        
        hoverText2
          .attr("x", hoverX2 + 5)
          .attr("y", hoverY + 7)
  
        let pointer = 0;
        if (y > 100 && y < 150){
          pointer = 1
        } else if (y > 150 && y < 210){
          pointer = 2;
        } else if (y > 220 && y < 260){
          pointer = 3;
        } else if (y > 280 && y < 310){
          pointer = 4;
        } else if (y > 320 && y < 370){
          pointer = 5;
        } else if (y > 380 && y < 420){
          pointer = 6;
        }
        // Split the tooltip text into two lines using <tspan>
        hoverText.text(`Name: ${teamOne}`);
        hoverText.append("tspan")
          .attr("x", hoverX + 5)
          .attr("dy", "1.2em") // Line spacing
          .text(`Map: ${mapNames[pointer]}`);
        hoverText.append("tspan")
          .attr("x", hoverX + 5)
          .attr("dy", "1.2em") // Line spacing
          .text(function () {
            if (Teams.get(teamOne)[criteria].get(mapNames[pointer]) === "BAN" && Teams.get(teamTwo)[criteria].get(mapNames[pointer]) === "BAN"){
              return "BAN by both team";
            }
            else if (Teams.get(teamOne)[criteria].get(mapNames[pointer]) === "BAN")
              return "BAN by " + teamOne;
            else if (Teams.get(teamTwo)[criteria].get(mapNames[pointer]) === "BAN")
              return "BAN by " + teamTwo;
            else
              return `WinRate: ${parseFloat(50+difference[pointer]).toFixed(2)}%`;
          });
        
        hoverText2.text(`Name: ${teamTwo}`);
        hoverText2.append("tspan")
          .attr("x", hoverX2 + 5)
          .attr("dy", "1.2em") // Line spacing
          .text(`Map: ${mapNames[pointer]}`);
        hoverText2.append("tspan")
          .attr("x", hoverX2 + 5)
          .attr("dy", "1.2em") // Line spacing
          .text(function () {
            if (Teams.get(teamOne)[criteria].get(mapNames[pointer]) === "BAN" && Teams.get(teamTwo)[criteria].get(mapNames[pointer]) === "BAN"){
              return "BAN by both team";
            }
            else if (Teams.get(teamOne)[criteria].get(mapNames[pointer]) === "BAN")
              return "BAN by " + teamOne;
            else if (Teams.get(teamTwo)[criteria].get(mapNames[pointer]) === "BAN")
              return "BAN by " + teamTwo;
            else
              return `WinRate: ${parseFloat(50+difference2[pointer]).toFixed(2)}%`;
          });
        
        hoverBox.style("display", "block");
        hoverText.style("display", "block");
        hoverBox2.style("display", "block");
        hoverText2.style("display", "block");
        })
        .on("mouseout", function () {
        // Hide the tooltip elements on mouseout
        hoverBox.style("display", "none");
        hoverText.style("display", "none");
        hoverBox2.style("display", "none");
        hoverText2.style("display", "none");
        })
        .attr("fill", d => {
        // left with update the box color
        if(d.Name === teamOne){
            return "steelblue"
        }else if (d.Name === teamTwo){
            return "orange"
        }else
            return "gray"
        })
      .attr("fill", (d) => (isNaN(d)) ? "gray" : "orange")
      .attr("width", 0)
      .transition()
      .duration(2000)
      .delay(function(d,i){
      return i * 50;
      })
      .attr("width", (d) => {
          if (isNaN(d)) {
              return xScale(100) - xScale(0); // or any other small positive value
          }
          return Math.abs(xScale(50+d) - xScale(0));
      });

      // Define variables to hold tooltip elements
      let hoverBox = svg.append("rect")
      .attr("class", "tooltip-box")
      .attr("width", 150)
      .attr("height", 65)
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

      // Define variables to hold tooltip elements
      let hoverBox2 = svg.append("rect")
      .attr("class", "tooltip-box")
      .attr("width", 150)
      .attr("height", 65)
      .attr("rx", 10) // Rounded corners
      .attr("ry", 10)
      .style("fill", "black") // Black background color
      .style("opacity", 0.8) // Adjust opacity
      .style("stroke", "white") // White border
      .style("stroke-width", 1.5) // Border width
      .style("filter", "drop-shadow(0 0 5px rgba(0,0,0,0.5))") // Add a drop shadow
      .style("display", "none");
  
      let hoverText2 = svg.append("text")
      .attr("class", "tooltip")
      .style("display", "none")
      .style("font-size", "12px") // Adjust font size
      .style("font-family", "Arial")
      .style("fill", "white")
      .style("pointer-events", "none");
    }


    playerVersus(svg, criteria) {

      var scaleList = [
        [64.0, 68.0, 72.0, 76.0, 80.0], // KAST
        [0.52, 0.64, 0.76, 0.88, 1.0], // KPR
        [25.0, 35.0, 45.0, 55.0, 65.0], // Headshot
        [0.8, 0.9, 1.0, 1.1, 1.2], // Impact
        [0.8, 0.9, 1.0, 1.1, 1.2], // Rating 2.0
      ];

      var startingPoint = [62, 0.40, 15.0, 0.7, 0.7];
      // assuming move clock wise
      // KAST, KPR, Headshot, Impact, Rating
      function getRScale(index) {
        return d3.scaleLinear()
          .range([0, 200])
          .domain([startingPoint[index], scaleList[index][4]]);
      }

      // making to two team players status
      var teamOne = this.buildTeamStatus("#pickTeamOne");
      var teamTwo = this.buildTeamStatus("#pickTeamTwo");
      this.playerVersusWinner(teamOne, teamTwo, d3.select("#pickTeamOne").node().value, d3.select("#pickTeamTwo").node().value);

      var teamOneData = teamOne.map(entry => {
        return { axis: entry[0], value: entry[1] };
      });
    
      var teamTwoData = teamTwo.map(entry => {
        return { axis: entry[0], value: entry[1] };
      });

      var gridAxis = svg.append("g")
      .attr("class", "radarWrapper")
      .attr("transform", function () {
        return `translate(${Width/2}, ${Height/2 + 25})`
      });

      // the background circle
      gridAxis.selectAll(".levels")
      .data(d3.range(1, 6))
      .enter()
      .append("circle")
      .attr("class", "gridCircle")
      .attr("r", function (d) {
        return (200 / 5) * d;
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
    
      // Draw the radar chart for Team One
      var teamOnePath = gridAxis.append("path")
      .datum(teamOneData)
      .attr("class", "radarArea")
      .on("mousemove", function (event, d) {
      const [x, y] = d3.pointer(event);
      
      // Position the tooltip relative to the chart rather than the mouse cursor
      var hoverX = x + 430; // Adjust the offset as needed
      var hoverY = y + 280; // Adjust the offset as needed
      if(hoverY < MARGIN.top)
      {
        hoverY = hoverY + 100;
      }
      if(hoverX > Width - MARGIN.right - 150)
      {
        hoverX = hoverX - 65;
      }
      else if(hoverX < MARGIN.left)
      {
        hoverX = hoverX + 50;
      }

      hoverBox
        .attr("x", hoverX)
        .attr("y", hoverY - 10);
      
      hoverText
        .attr("x", hoverX + 5)
        .attr("y", hoverY + 7)
  
      // Split the tooltip text into two lines using <tspan>
      hoverText.text(`Name: ${d3.select("#pickTeamOne").node().value}`);
      hoverText.append("tspan")
      .attr("x", hoverX + 5)
      .attr("dy", "1.2em") // Line spacing
      .text(`KAST: ${parseFloat(teamOne[0][1]).toFixed(2)}`);
      hoverText.append("tspan")
      .attr("x", hoverX + 5)
      .attr("dy", "1.2em") // Line spacing
      .text(`KPR: ${parseFloat(teamOne[1][1]).toFixed(2)}`);
      hoverText.append("tspan")
      .attr("x", hoverX + 5)
      .attr("dy", "1.2em") // Line spacing
      .text(`Headshot %: ${parseFloat(teamOne[2][1]).toFixed(2)}`);
      hoverText.append("tspan")
      .attr("x", hoverX + 5)
      .attr("dy", "1.2em") // Line spacing
      .text(`Impact: ${parseFloat(teamOne[3][1]).toFixed(2)}`);
      hoverText.append("tspan")
      .attr("x", hoverX + 5)
      .attr("dy", "1.2em") // Line spacing
      .text(`Rating: ${parseFloat(teamOne[4][1]).toFixed(2)}`);
      hoverBox.style("display", "block");
      hoverText.style("display", "block");
      })
      .on("mouseout", function () {
        // Hide the tooltip elements on mouseout
        hoverBox.style("display", "none");
        hoverText.style("display", "none");
      })
      .style("fill", "steelblue")
      .style("fill-opacity", 0.7)
      .style("stroke", "steelblue")
      .style("stroke-width", "2px")
      .attr("d", startRadarLine)
      .transition()
      .duration(1000)
      .delay(function(d,i){
      return i * 50;
      })
      .attr("d", radarLine);

      gridAxis.selectAll(".dotTeamOne")
      .data(teamOneData)
      .enter().append("circle")
      .attr("class", "dotTeamOne")
      .attr("r", 5) // Adjust the radius of the circles
      .attr("cx", function (d, i) { return getRScale(i)(d.value) * Math.cos(angleSlice * i - Math.PI / 2); })
      .attr("cy", function (d, i) { return getRScale(i)(d.value) * Math.sin(angleSlice * i - Math.PI / 2); })
      .style("fill", "steelblue")
      .style("fill-opacity", 0.8)
      .style("stroke", "steelblue");
  
      // Draw the radar chart for Team Two
      var teamTwoPath = gridAxis.append("path")
      .datum(teamTwoData)
      .attr("class", "radarArea")
      .on("mousemove", function (event, d) {
      const [x, y] = d3.pointer(event);
      
      // Position the tooltip relative to the chart rather than the mouse cursor
      var hoverX = x + 430; // Adjust the offset as needed
      var hoverY = y + 280; // Adjust the offset as needed
      if(hoverY < MARGIN.top)
      {
        hoverY = hoverY + 100;
      }
      if(hoverX > Width - MARGIN.right - 150)
      {
        hoverX = hoverX - 65;
      }
      else if(hoverX < MARGIN.left)
      {
        hoverX = hoverX + 50;
      }

      hoverBox
        .attr("x", hoverX)
        .attr("y", hoverY - 10);
      
      hoverText
        .attr("x", hoverX + 5)
        .attr("y", hoverY + 7)
  
      // Split the tooltip text into two lines using <tspan>
      hoverText.text(`Name: ${d3.select("#pickTeamTwo").node().value}`);
      hoverText.append("tspan")
      .attr("x", hoverX + 5)
      .attr("dy", "1.2em") // Line spacing
      .text(`KAST: ${parseFloat(teamTwo[0][1]).toFixed(2)}`);
      hoverText.append("tspan")
      .attr("x", hoverX + 5)
      .attr("dy", "1.2em") // Line spacing
      .text(`KPR: ${parseFloat(teamTwo[1][1]).toFixed(2)}`);
      hoverText.append("tspan")
      .attr("x", hoverX + 5)
      .attr("dy", "1.2em") // Line spacing
      .text(`Headshot %: ${parseFloat(teamTwo[2][1]).toFixed(2)}`);
      hoverText.append("tspan")
      .attr("x", hoverX + 5)
      .attr("dy", "1.2em") // Line spacing
      .text(`Impact: ${parseFloat(teamTwo[3][1]).toFixed(2)}`);
      hoverText.append("tspan")
      .attr("x", hoverX + 5)
      .attr("dy", "1.2em") // Line spacing
      .text(`Rating: ${parseFloat(teamTwo[4][1]).toFixed(2)}`);
      hoverBox.style("display", "block");
      hoverText.style("display", "block");
      })
      .on("mouseout", function () {
        // Hide the tooltip elements on mouseout
        hoverBox.style("display", "none");
        hoverText.style("display", "none");
      })
      .style("fill", "orange")
      .style("fill-opacity", 0.4)
      .style("stroke", "orange")
      .style("stroke-width", "2px")
      .attr("d", startRadarLine)
      .transition()
      .duration(1000)
      .delay(function(d,i){
      return i * 50;
      })
      .attr("d", radarLine);

      gridAxis.selectAll(".dotTeamTwo")
      .data(teamTwoData)
      .enter().append("circle")
      .attr("class", "dotTeamTwo")
      .attr("r", 5) // Adjust the radius of the circles
      .attr("cx", function (d, i) { return getRScale(i)(d.value) * Math.cos(angleSlice * i - Math.PI / 2); })
      .attr("cy", function (d, i) { return getRScale(i)(d.value) * Math.sin(angleSlice * i - Math.PI / 2); })
      .style("fill", "orange")
      .style("fill-opacity", 0.8)
      .style("stroke", "orange");
    
      let xOffset = [-10, 10, 0, -25, -50];
      let yOffset = [-15, 0, 25, 25, 0];

      axis.append("text")
      .attr("class", "legend")
      .style("font-size", "20px")
      .style("fill", "white")
      .style("stroke", "white")
      .style("font-family", "Teko")
      .attr("x", function (d, i) { return getRScale(i)(scaleList[i][4]) * Math.cos(angleSlice * i - Math.PI / 2) + xOffset[i]; })
      .attr("y", function (d, i) { return getRScale(i)(scaleList[i][4]) * Math.sin(angleSlice * i - Math.PI / 2) + yOffset[i]; })
      .text(function (d, i) { return criteria[i]; });
    
      let xTextOffset = [-7, 4, 0, -10, -10];
      let yTextOffset = [-8, 2, 7, 7, 3];

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
              .attr("x", getRScale(dataIndex)(scaleList[dataIndex][i]) * Math.cos(angle) + xTextOffset[dataIndex])
              .attr("y", getRScale(dataIndex)(scaleList[dataIndex][i]) * Math.sin(angle) + yTextOffset[dataIndex]);
          });
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
    }
    
    weeksInTop30(svg, criteria){
      
      let teamOne = d3.select("#pickTeamOne").node().value;
      let teamTwo = d3.select("#pickTeamTwo").node().value;
      var teamOneScoreText = document.getElementById('teamOneScore');
      var teamTwoScoreText = document.getElementById('teamTwoScore');

      let winner = teamOne;
      if (teamOneScore + teamTwoScore < 5){
        if (Teams.get(teamOne)[criteria] > Teams.get(teamTwo)[criteria]){
          winnerList[count] = 1;
          teamOneScore++;
        }else{
          winnerList[count] = 2;
          winner = teamTwo;
          teamTwoScore++;
        }
        teamOneScoreText.textContent = "SCORE " + teamOneScore;
        teamTwoScoreText.textContent = "SCORE " + teamTwoScore;

        winnerText.textContent = winner.toUpperCase() + " has more weeks in top 30 ranking"
      }

      this.xScale = d3.scalePoint()
      .domain(ALLTEAMNAME)
      .range([MARGIN.left, Width - MARGIN.right]);

      this.yScale = d3.scaleLinear()
      .domain([250,0])
      .range([MARGIN.top, Height - MARGIN.bottom]);


      svg.append("g")
      .attr("class", "Axis")
      .attr("transform", function () {
        return `translate(0, 410)`
      })
      .call(d3.axisBottom(this.xScale))
      .selectAll("text")
      .style("text-anchor", "end") // Adjust text alignment if needed
      .attr("transform", "rotate(-45) translate(-10, 0)"); // Rotate the text to be vertical

      svg.append("g")
      .attr("class", "Axis")
      .attr("transform", function () {
        return `translate(${MARGIN.left}, ${MARGIN.top - 50})`;
      })
      .call(d3.axisLeft(this.yScale).ticks(30));

      let weeksIn30 = Array.from(Teams.values()).map(team => ({
        Name: team.Name,
        [criteria]: team[criteria],
        Region: team.Region,
        Country: team.Country,
      }));


      // Append a group for the circles
      const scatterGroup = svg.append("g")
      .attr("class", "scatter-plot");

      // Appending the circles, including hovered and getting cases and data
      scatterGroup.selectAll(".scatter-circle")
      .data(weeksIn30)
      .enter()
      .append("circle")
      .attr("class", "scatter-circle")
      .attr("stroke", "#666") // Add a border to the circles
      .attr("stroke-width", 1.10) // Set the border width
      .on("mouseover", function() {
         d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 15); // Change circle size on hover
      })
      .on("mousemove", function (event, d) {
      const [x, y] = d3.pointer(event);
      
      // Position the tooltip relative to the chart rather than the mouse cursor
      var hoverX = x - 100; // Adjust the offset as needed
      var hoverY = y - 70; // Adjust the offset as needed
      if(hoverY < MARGIN.top)
      {
        hoverY = hoverY + 100;
      }
      if(hoverX > Width - MARGIN.right - 150)
      {
        hoverX = hoverX - 65;
      }
      else if(hoverX < MARGIN.left)
      {
        hoverX = hoverX + 50;
      }

      hoverBox
        .attr("x", hoverX)
        .attr("y", hoverY - 10);
      
      hoverText
        .attr("x", hoverX + 5)
        .attr("y", hoverY + 7)
  
      // Split the tooltip text into two lines using <tspan>
      hoverText.text(`Name: ${d.Name}`);
      hoverText.append("tspan")
        .attr("x", hoverX + 5)
        .attr("dy", "1.2em") // Line spacing
        .text(`Weeks in top 30: ${d[criteria]}`);
      hoverText.append("tspan")
        .attr("x", hoverX + 5)
        .attr("dy", "1.2em") // Line spacing
        .text(`Region: ${d.Region}`);
      hoverText.append("tspan")
        .attr("x", hoverX + 5)
        .attr("dy", "1.2em") // Line spacing
        .text(`Country: ${d.Country}`);
      
      hoverBox.style("display", "block");
      hoverText.style("display", "block");
      })
      .on("mouseout", function () {
      // Hide the tooltip elements on mouseout
      hoverBox.style("display", "none");
      hoverText.style("display", "none");
      d3.select(this)
      .transition()
      .duration(200)
      .attr("r", 7); // Restore circle size on mouseout
      })
      .transition()
      .duration(700)
      .delay(function(d,i){
      return i * 50;
      })
      .attr("cx", (d) => this.xScale(d.Name)) 
      .attr("cy", (d) => this.yScale(d[criteria] + 12)) 
      .attr("r", 7)
      .attr("fill", d => {
      // left with update the box color
      if(d.Name === teamOne){
          return "blue"
      }else if (d.Name === teamTwo){
          return "orange"
      }else
          return "gray"
      });

      // Define variables to hold tooltip elements
      let hoverBox = svg.append("rect")
      .attr("class", "tooltip-box")
      .attr("width", 200)
      .attr("height", 65)
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

      this.displayWinnerImage();
    }

    // A helper method to build the team players status into a whole
    buildTeamStatus(oneOrTwo) {
      let team = Teams.get(d3.select(oneOrTwo).node().value);

      var totalTeamStatus = new Map([
        ["KAST", 0],
        ["KPR", 0],
        ["Headshot", 0],
        ["Impact", 0],
        ["Rating", 0],
      ]);

      // Assuming your team data is stored in a variable named 'team'
      team.Players.forEach((player) => {
        totalTeamStatus.set("KAST", totalTeamStatus.get("KAST") + player.playerKAST);
        totalTeamStatus.set("KPR", totalTeamStatus.get("KPR") + player.playerKPR);
        totalTeamStatus.set("Headshot", totalTeamStatus.get("Headshot") + player.playerHeadshot);
        totalTeamStatus.set("Impact", totalTeamStatus.get("Impact") + player.playerImpact);
        totalTeamStatus.set("Rating", totalTeamStatus.get("Rating") + player.playerRating);
      });

      totalTeamStatus.set("KAST", totalTeamStatus.get("KAST") / 5);
      totalTeamStatus.set("KPR", totalTeamStatus.get("KPR") / 5);
      totalTeamStatus.set("Headshot", totalTeamStatus.get("Headshot") / 5);
      totalTeamStatus.set("Impact", totalTeamStatus.get("Impact") / 5);
      totalTeamStatus.set("Rating", totalTeamStatus.get("Rating") / 5);

      return Array.from(totalTeamStatus);
    }

    // A helper method that compute the players status of both team and find out the winner
    playerVersusWinner(teamOne, teamTwo, teamOneName, teamTwoName) {
      var winnerText = document.getElementById('winnerText');
      var teamOneScoreText = document.getElementById('teamOneScore');
      var teamTwoScoreText = document.getElementById('teamTwoScore');

      let teamOneWinCount = 0;
      let teamTwoWinCount = 0;

      // a loop comparing the 5 status -> KAST, KPR, Headshot, Impact, Rating
      for (let i = 0; i < 5; i++){
        if (teamOne[i][1] < teamTwo[i][1]){
          teamTwoWinCount++;
        }else{
          teamOneWinCount++;
        }
      }

      if (teamOneWinCount > teamTwoWinCount){
        winnerText.textContent = teamOneName.toUpperCase() + " players have the greater stats";
        winnerList[count] = 1;
        teamOneScore++;
      }
      else {
        winnerText.textContent = teamTwoName.toUpperCase() + " players has the greater stats";
        winnerList[count] = 2;
        teamTwoScore++;
      }
      teamOneScoreText.textContent = "SCORE " + teamOneScore;
      teamTwoScoreText.textContent = "SCORE " + teamTwoScore;
    }

    // A helper method to build up the team map win rate array
    buildMapData(team, mapNames) {
      // order of the mapNames -> "Inferno", "Mirage", "Nuke", "Anubis", "Overpass", "Vertigo", "Ancient"

      var MapsWinRate = new Map([
        ["Inferno", 0.0],
        ["Mirage", 0.0],
        ["Nuke", 0.0],
        ["Anubis", 0.0],
        ["Overpass", 0.0],
        ["Vertigo", 0.0],
        ["Ancient", 0.0],
      ]);

      for (let i = 0; i < mapNames.length; i++){
        MapsWinRate.set(mapNames[i], team.get(mapNames[i]));
      }

      return Array.from(MapsWinRate);
    }

    // A helper method to calculate the difference between the two teams of each map
    calculateWinRateDifference(teamOneMapWinRates, teamTwoMapWinRates) {
      // order of the mapNames -> "Inferno", "Mirage", "Nuke", "Anubis", "Overpass", "Vertigo", "Ancient"
      var difference = [0, 0, 0, 0, 0, 0, 0];
      // 7 maps in total
      for (let i = 0; i < 7; i++) {
        // if is "BAN" the result = "BAN" <- proof by test
        let result = teamOneMapWinRates[i][1] - teamTwoMapWinRates[i][1];
        difference[i] = result / 2;
      }
      return difference;
    }

    displayWinnerImage(){
      let isWinnerVisible = false;

      if (teamOneScore > teamTwoScore) {
        isWinnerVisible = !isWinnerVisible; // Toggle the boolean value
        const winnerImage = document.getElementById('winnerTeamOne')
        winnerImage.style.display = isWinnerVisible ? 'block' : 'none';
      }
      else {
        isWinnerVisible = !isWinnerVisible;
        const winnerImage = document.getElementById('winnerTeamTwo')
        winnerImage.style.display = isWinnerVisible ? 'block' : 'none';
      }
    }
}