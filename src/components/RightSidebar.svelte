<div class="col-span-3 bg-slate-800 text-neutral-50 px-8 py-16">
  <div class="moveHistory grid grid-cols-2 bg-slate-700">
    {#each $moveHistory as move}
      <div class="text-xl p-2 font-semibold">{convertMoveToAlgebraicNotation(move)}</div>
    {/each}
  </div>
</div>

<script lang="ts">
	import { convertNumberToAlgebraicNotation } from "$lib/Engine";
	import { Piece } from "$lib/Piece";
	import { PieceCharLookup, PieceType, alphabet, fileArray } from "$lib/misc";
  import moveHistory, { type moveHistoryType } from "$stores/MoveHistory";


  const convertMoveToAlgebraicNotation = (move: moveHistoryType) => {
    // Castling notation
    if(move.note?.[move.turn] === "kingSide")return "O-O"
    else if(move.note?.[move.turn] === "queenSide")return "O-O-O"

    let piece = PieceCharLookup[Piece.getPiece(move.pieceToMove)]
    let targetNotation = convertNumberToAlgebraicNotation(move.targetTile)

    let isCapture = false
    if(!!move.pieceTarget)isCapture = true


    let shouldSpecifyFiles = move.moveList
      .some(e => e.start != move.startTile && e.target === move.targetTile && move.pieceToMove === move.newBoardArray.get(e.start)) 
      || (Piece.isType(move.pieceToMove, PieceType.Pawn) && isCapture)


    let files:string = "";

    if(piece === "P")piece = ""
    if(shouldSpecifyFiles)files = alphabet[Piece.getFile(move.startTile)]

    let isACheck = false

    return `${piece}${files}${isCapture ? "x" : "" }${targetNotation}${isACheck?"+":""}`
  }

</script>