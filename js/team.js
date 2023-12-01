/** Class representing a Team. */
class TEAM {
   /**
     * Creates a Team Object
     * @param {string} Name - The name of the team
     * @param {double} HLTV - The team's ranking in HLTV
     * @param {double} Valve - The team's ranking Valve
     * @param {double} Weeks - The amount of weeks the team was in top 30
     * @param {double} Region - The team's region of play
     * @param {double} Country - The team's country representation
     */
    constructor(Name, HLTV, Valve, Weeks, Region, Country) {

        /** Team Name */
        this.Name = Name;

        /** Team HLTV ranking */
        this.HLTV = HLTV;

        /** Team Valve ranking */
        this.Valve = Valve;

        /** Team amount of weeks the team was in top 30 */
        this.Weeks = Weeks;

        /** Positions of each player on the team */
        this.PlayerPositions = new Map();
        
        /** Team player list */
        this.Players = new Map();

        /** Team map win rate list */
        this.MapsWinRate = new Map();

        /** Region the team is part of*/
        this.Region = Region;

        /** What country the team represents */
        this.Country = Country;
    }
}