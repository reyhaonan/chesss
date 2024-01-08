import { Piece } from "./misc";

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