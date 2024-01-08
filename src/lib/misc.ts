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


enum Direction {
  TopLeft = -9,   Top = -8,   TopRight = -7,
  Left = -1,                  Right = 1,
  BottomLeft = 7, Bottom = 8, BottomRight = 9,
}

export const direction = [
  // Vertical and horizontal
  Direction.Top, Direction.Right, Direction.Bottom, Direction.Left, 

  // Diagonal
  Direction.TopLeft, Direction.TopRight, Direction.BottomRight, Direction.BottomLeft
]

export const numberOfTilesToEdge = (): number[][] => {
  const temp:number[][] = [];

  for(let file = 0; file < 8; file++){
    for(let rank = 0; rank < 8; rank++){
      let nNorth = 7 - rank;
      let nEast = 7 - file;
      let nSouth = rank;
      let nWest = file;
      
      let tile = rank * 8 + file

      temp[tile] = [
        nNorth, nEast, nSouth, nWest,
        Math.min(nNorth, nWest), Math.min(nNorth, nEast), Math.min(nSouth, nEast), Math.min(nSouth, nWest),
      ]
    }
  }

  return temp
}