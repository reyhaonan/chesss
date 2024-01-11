
export const startingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";


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

export type Move = {
  start:number;
  target:number
}

export type Color = "W"|"B"