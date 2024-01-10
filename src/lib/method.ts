
import { direction, type Color } from "./misc";


// export const generateMoves = (piece: ) => {}


export const convertFENToBoardArray = (FEN: string) => {
  const boardArray: number[] = [];

  FEN.split(" ")[0].split("/").forEach((rank) => {
    rank.split("").forEach((piece) => {
      let color: number =
        piece == piece.toUpperCase() ? Piece.White : Piece.Black;

      switch (piece.toLowerCase()) {
        case "k":
          boardArray.push(Piece.King + color);
          break;
        case "p":
          boardArray.push(Piece.Pawn + color);
          break;
        case "n":
          boardArray.push(Piece.Knight + color);
          break;
        case "b":
          boardArray.push(Piece.Bishop + color);
          break;
        case "r":
          boardArray.push(Piece.Rook + color);
          break;
        case "q":
          boardArray.push(Piece.Queen + color);
          break;

        default:
          boardArray.push(...Array(Number(piece)).fill(Piece.None));
      }
    });
  });

  return boardArray;
};


const generateNumberOfTilesToEdge = (): number[][] => {
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



export const numberOfTilesToEdge = generateNumberOfTilesToEdge()


export const Piece = {

  None : 0,
  King:1,
  Pawn:2,
  Knight:3,
  Bishop:4,
  Rook:5,
  Queen:6,

  // 9 is White king
  // 14 is White queen
  // 17 is Black king
  // 22 is Black queen
  White : 8,
  Black : 16,

  sameColor : (piece:number, color:Color) => {
    if(piece == 0)return false
        // black                       or  white
    return (piece > 16 && color == "B") || (piece < 16 && color == "W")
  },

  /**
   * 
   * @param piece 
   * @param pieceTypeToCompare 
   * @returns boolean
   */
  isType : (piece:number, pieceTypeToCompare:number) => (piece - Piece.Black) === pieceTypeToCompare || (piece - Piece.White) === pieceTypeToCompare,

  /**
   * 
   * @param tileNumber 
   * @returns 0-7
   */
  getFile : (tileNumber:number) => (tileNumber / 8)
}