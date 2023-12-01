const MARGIN = { left: 100, bottom: 20, top: 30, right: 50 };
const Width = 1000;
const Height = 450;
const ALLTEAMNAME = ['1WIN', "9INE", "Apeks", "Astralis", "Aurora", "Bad News Eagles", "BIG", "Cloud9", "Complexity", "ENCE", "Evil Geniuses ", "Faze", "Fnatic", "Furia", "G2", "Gamer Legion", "Heroic", "Imperial", "MIBR", "Monte", "Mouz", "Movistar Rider", "Natus Vincere", "Ninjas in Pyjamas", "OG", "Spirit", "Team Liquid", "TheMongolz", "Virtus Pro", "Vitality"];
const RANKING = [30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
var count = 0;
// winnerList will track each rounds winner
var winnerList = [0, 0, 0, 0, 0];
var teamOneScore = 0;
var teamTwoScore = 0;

var View = new VIEW();
// make the 30 Teams array 
const Teams = new Map();
fetchJSONFile('Data/Teams.json', function (teamData) {
  for (const team of teamData){
    Teams.set(team["Team"], new TEAM(team["Team"], team["HLTV Rank"], team["Valve Rank"], team["Weeks in Top 30"], team["Region"], team["Country"]));
  }
  makeData();
});

// set up function, setting up eventListener for user to control
function setup () {
  const teamOne = document.getElementById('pickTeamOne');
  const teamTwo = document.getElementById('pickTeamTwo');
  const back = document.getElementById('backArrow');
  const forward = document.getElementById('forwardArrow');
  var criteriaText = document.getElementById('criteriaText');
  var winnerText = document.getElementById('winnerText');

  teamTwo.addEventListener('change', updateTeamTwo);
  teamOne.addEventListener('change', updateTeamOne);
  back.addEventListener('click', backCriteria);
  forward.addEventListener('click', nextCriteria);

  update();
}

function nextCriteria(){
  count++;
  update();
}
  
function backCriteria(){
  // took a score off from the current winner
  if (winnerList[count] == 1){
    teamOneScore--;
  }
  else if (winnerList[count] == 2) {
    teamTwoScore--;
  }

  // move to the previous visualization
  // the previous winner and took a score off
  // so the math work fine when we redraw the visualzation -> it found a winner and add score
  count--;
  if (winnerList[count] == 1){
    teamOneScore--;
  }
  // means the previous winner was the second team
  else if (winnerList[count] == 2) {
    teamTwoScore--;
  }

  if (count < 0)
    count = 0;
  update();
}
 
function restart(){
  teamTwoScore = 0;
  teamOneScore = 0;
  count = 0;
}

// Update team one Icon when drop down menu for team one changed
function updateTeamOne() {
  const teamName = d3.select("#pickTeamOne").node().value;
  const image = document.getElementById('teamOneLogo');
  image.setAttribute('src', `./images/${teamName}/${teamName}.png`);
  restart();
  update();
}

// Update team two Icon when drop down menu for team two changed
function updateTeamTwo() {
  const teamName = d3.select("#pickTeamTwo").node().value;
  const image = document.getElementById('teamTwoLogo');
  image.setAttribute('src', `./images/${teamName}/${teamName}.png`);
  restart();
  update();
}

// This function will update the scales for the graph then called updateVisual
function update(){
  let svg = d3.select("#visualization svg");
  View.reset(svg);

  isWinnerVisible = false;
  const winnerImage = document.getElementById('winnerTeamOne')
  const SecondwinnerImage = document.getElementById('winnerTeamTwo')

  winnerImage.style.display = isWinnerVisible ? 'block' : 'none';
  SecondwinnerImage.style.display = isWinnerVisible ? 'block' : 'none';

  switch (count){
    case 0:
      criteriaText.textContent = "Team Ranking's in HLTV";
      View.rankBarGraph(svg, "HLTV");
    break;
    case 1:
      criteriaText.textContent = "Team Ranking's in VALVE";
      View.rankBarGraph(svg, "Valve");
    break;
    case 2:
      criteriaText.textContent = "Comparative Team Map Win Rate Percentages";
      View.mapWinRates(svg, "MapsWinRate");
    break;
    case 3:
      criteriaText.textContent = "Team Player Stats Comparison";
      View.playerVersus(svg, ["KAST", "KPR", "Headshot %", "Impact", "Rating"]);
    break;
    default:
      count = 4;
    case 4:
      criteriaText.textContent = "Team's Total Weeks in Top 30 Ranking";
      View.weeksInTop30(svg, "Weeks");
    break;
  }
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
    console.log(Teams);
  });
  setup();
}
// fetch function that parse json to array
function fetchJSONFile (path, callback) {
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