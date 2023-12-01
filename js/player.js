/** Class representing a Player. */
class Player {
    /**
     * Creates a Player Object
     * @param {string} Name - The name of the player
     * @param {double} rating - The player's rating in CSGO
     * @param {double} headshot - The player's headshot percentage in CSGO
     * @param {double} kpr - The player's kill per round (KPR) in CSGO
     * @param {double} kast - The player's kills assists survived and traded rating in CSGO
     * @param {double} impact - The player's impact in a rating in CSGO
     * @param {string} teamName - The player's team 
     */
    constructor(Name, rating, headshot, kpr, kast, impact) {
        //Name Rating, Headshot, KPR, KAST, Impact

        /** Player Name */
        this.Name = Name;

        /** Player rating for player */
        this.playerRating = rating;

        /** Player headshot percentage */
        this.playerHeadshot = headshot;

        /** Player Kill per Round (KPR) */
        this.playerKPR = kpr;

        /** Player Kills Assists Survived and Traded */
        this.playerKAST = kast;

        /** Player Impact */
        this.playerImpact = impact;

        /** Player rating of the tournament */
        this.tournamentRating = new Map();
    }   
}