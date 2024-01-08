export enum Piece {
  None = 0,
  King,
  Pawn,
  Knight,
  Bishop,
  Rook,
  Queen,

  //
  White = 8,
  Black = 16,

  // 9 is White king
  // 14 is White queen
  // 17 is Black king
  // 22 is Black queen
}


export const startingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
