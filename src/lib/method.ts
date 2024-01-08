import { Piece } from "./misc";


// export const generateMoves = (piece: ) => {}


export const convertFENToBoardArray = (FEN: string) => {
  const boardArray: number[] = [];

  FEN.split(" ")[0].split("/").forEach((rank) => {
    rank.split("").forEach((piece) => {
      let color: number =
        piece == piece.toUpperCase() ? Piece["White"] : Piece["Black"];

      switch (piece.toLowerCase()) {
        case "k":
          boardArray.push(Piece["King"] + color);
          break;
        case "p":
          boardArray.push(Piece["Pawn"] + color);
          break;
        case "n":
          boardArray.push(Piece["Knight"] + color);
          break;
        case "b":
          boardArray.push(Piece["Bishop"] + color);
          break;
        case "r":
          boardArray.push(Piece["Rook"] + color);
          break;
        case "q":
          boardArray.push(Piece["Queen"] + color);
          break;

        default:
          boardArray.push(...Array(Number(piece)).fill(Piece["None"]));
      }
    });
  });

  return boardArray;
};


export const numberOfTilesToEdge = (): number[][] => {
  const temp:number[][] = [];

  for(let file = 0; file < 8; file++){
    for(let rank = 0; rank < 8; rank++){
      

      
      let nNorth = file;
      let nEast = 7 - rank;
      let nSouth = 7 - file;
      let nWest = rank;
      
      let tile = file * 8 + rank

      temp[tile] = [
        nNorth, nEast, nSouth, nWest,
        Math.min(nNorth, nWest), Math.min(nNorth, nEast), Math.min(nSouth, nEast), Math.min(nSouth, nWest),
      ]
    }
  }

  return temp
}