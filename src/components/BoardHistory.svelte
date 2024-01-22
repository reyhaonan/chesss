<script lang="ts">
	import { convertNumberToAlgebraicNotation } from '$lib/Engine';
	import { Piece } from '$lib/Piece';
	import { PieceCharLookup, PieceType, fileArray, rankArray } from '$lib/misc';
	import boardLookup from '$stores/BoardLookup';
	import moveHistory, { type moveHistoryType } from '$stores/MoveHistory';
	import ControlBar from './ControlBar.svelte';

	const convertMoveToAlgebraicNotation = (move: moveHistoryType) => {
		// Castling notation
		if (move.note?.[move.turn] === 'kingSide') return 'O-O';
		else if (move.note?.[move.turn] === 'queenSide') return 'O-O-O';

		let piece = PieceCharLookup[Piece.getPiece(move.pieceToMove)];
		let targetNotation = convertNumberToAlgebraicNotation(move.targetTile);

		let isPromotion = move.note === 'promote';
		let isCapture = false;
		if (!!move.pieceTarget || move.note === 'enPassant') isCapture = true;

		let shouldSpecifyFile =
			move.moveList.some(
				(e) =>
					e.start != move.startTile &&
					Piece.getRank(e.start) === Piece.getRank(move.startTile) &&
					e.target === move.targetTile &&
					move.pieceToMove === move.newBoardArray.get(e.start)
			) ||
			(Piece.isType(move.pieceToMove, PieceType.Pawn) && isCapture);

		let shouldSpecifyRank =
			move.moveList.some(
				(e) =>
					e.start != move.startTile &&
					Piece.getFile(e.start) === Piece.getFile(move.startTile) &&
					e.target === move.targetTile &&
					move.pieceToMove === move.newBoardArray.get(e.start)
			) ||
			(Piece.isType(move.pieceToMove, PieceType.Pawn) && isCapture);

		let file: string = '';
		let rank: string = '';

		if (piece === 'P') piece = '';
		if (shouldSpecifyFile) file = fileArray[Piece.getFile(move.startTile)];
		if (shouldSpecifyRank) rank = rankArray[Piece.getRank(move.startTile)].toString();

		let isACheck = move.threatListToOpponent.some((e) =>
			Piece.isType(move.newBoardArray.get(e.target), PieceType.King)
		);

		return `${piece}${file}${rank}${isCapture ? 'x' : ''}${targetNotation}${
			move.isCheckMate ? '#' : isACheck ? '+' : ''
		}${isPromotion && move.pickedPiece ? PieceCharLookup[Piece.getPiece(move.pickedPiece)] : ''}`;
	};
</script>

<div class="moveHistory border-primary/30 rounded-b-lg border-2 h-[40vh] overflow-auto">
	<div class="grid grid-cols-8">
		{#each $moveHistory as move, i}
			{#if i % 2 === 0}
				<div class="px-3 py-1 font-semibold text-center col-span-2 bg-primary/20 h-max">
					{i / 2 + 1}
				</div>
			{/if}
			<button
				on:click={() => ($boardLookup.lookup = i)}
				class={`px-3 py-1 font-semibold h-max col-span-3 text-left ${
					$boardLookup.lookup === i ? 'bg-secondary/60' : ''
				}`}
			>
				{convertMoveToAlgebraicNotation(move)}
			</button>
		{/each}
	</div>
</div>
