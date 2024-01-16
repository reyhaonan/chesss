<div class="col-span-3 bg-slate-800 text-neutral-50 px-8 py-16">
  <div class="moveHistory grid grid-cols-8 bg-slate-700">

    {#each $moveHistory as move, i}
      {#if i % 2 === 0}
        <div class="px-3 py-1 font-semibold text-center col-span-2 bg-slate-600">{(i / 2) + 1}</div>
      {/if}
      <button 
        on:click={() => $boardLookup.lookup = i}
        class={`px-3 py-1 font-semibold col-span-3 text-left ${$boardLookup.lookup === i?"bg-violet-800/60":""}`}
        >
        {convertMoveToAlgebraicNotation(move)}
      </button>
    {/each}
  </div>
  {JSON.stringify($boardLookup)}
</div>

<script lang="ts">
	import { convertNumberToAlgebraicNotation } from "$lib/Engine";
	import { Piece } from "$lib/Piece";
	import { PieceCharLookup, PieceType, alphabet, fileArray } from "$lib/misc";
	import boardLookup from "$stores/BoardLookup";
  import moveHistory, { type moveHistoryType } from "$stores/MoveHistory";



  const convertMoveToAlgebraicNotation = (move: moveHistoryType) => {
    // Castling notation
    if(move.note?.[move.turn] === "kingSide")return "O-O"
    else if(move.note?.[move.turn] === "queenSide")return "O-O-O"

    let piece = PieceCharLookup[Piece.getPiece(move.pieceToMove)]
    let targetNotation = convertNumberToAlgebraicNotation(move.targetTile)

    let isCapture = false
    if(!!move.pieceTarget || move.note === "enPassant")isCapture = true


    let shouldSpecifyFiles = move.moveList
      .some(e => e.start != move.startTile && e.target === move.targetTile && move.pieceToMove === move.newBoardArray.get(e.start)) 
      || (Piece.isType(move.pieceToMove, PieceType.Pawn) && isCapture)


    let files:string = "";

    if(piece === "P")piece = ""
    if(shouldSpecifyFiles)files = alphabet[Piece.getFile(move.startTile)]

    let isACheck = move.threatListToOpponent.some(e => Piece.isType(move.newBoardArray.get(e.target), PieceType.King))

    return `${piece}${files}${isCapture ? "x" : "" }${targetNotation}${move.isCheckMate?"#":isACheck?"+":""}`
  }

</script>