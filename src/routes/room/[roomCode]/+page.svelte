<script lang="ts">
	import Board from '$components/Board.svelte';
	import ControlBar from '$components/ControlBar.svelte';
	import ProfileSection from '$components/ProfileSection.svelte';
	import Tile from '$components/Tile.svelte';
	import {
		convertFENToBoardArray,
		executeMove,
		generateMoves,
		isThreefoldRepetition
	} from '$lib/Engine';
	import { Piece } from '$lib/Piece';
	import {
		startingFEN,
		type Move,
		type Color,
		type BoardHistory,
		PieceColor,
		PieceType,
		boardIterable,
		reversedBoardIterable
	} from '$lib/misc';
	import boardInfo from '$stores/BoardInfo';
	import boardLookup from '$stores/BoardLookup';
	import flipBoard from '$stores/FlipBoard';
	import moveHistory from '$stores/MoveHistory';
	import { flip } from 'svelte/animate';
	import { send, receive } from '$lib/transition';

	$boardInfo = convertFENToBoardArray(startingFEN);
	// $boardInfo = convertFENToBoardArray('3r3r/8/8/R7/4Q2Q/8/8/R6Q w KQkq - 0 1');

	$: [boardArray, turn, castlingRights, enPassantTarget, halfMoveClock, fullMoveClock] = $boardInfo;

	$: console.log('BO', $boardInfo[0], boardArray.get(1));

	let moveList: Move[] = [];

	let threatMoveList: Move[] = [];

	let boardToUse:{id: number, uniqueId:string, piece:number}[] = []

	$: {
		$flipBoard;
		boardArray;
		let tempBoard = []
		tempBoard = $flipBoard ? reversedBoardIterable : boardIterable;
		boardToUse = tempBoard.map(e => ({id:e, piece: boardArray.get(e)??0, uniqueId: `${e}-${boardArray.get(e)}`}))
	}

	let selectedTile: number = -1;

	let piecePickerIsOpen = false;
	let topOffset = 0;
	let leftOffset = 0;

	let lastMove: number[] = [];

	// i store only 10 of these for threefold checks
	let boardArrayHistory: BoardHistory[] = [];

	let isCheck: number | null = null;

	$: boardArray,
		(threatMoveList = generateMoves(
			boardArray,
			turn === 'White' ? 'Black' : 'White',
			castlingRights,
			enPassantTarget,
			halfMoveClock,
			fullMoveClock,
			[]
		));
	$: boardArray, threeFoldCheck();
	$: isCheck =
		threatMoveList.find((move) => Piece.isType(boardArray.get(move.target), PieceType.King))
			?.target ?? null;
	$: threatMoveList,
		(moveList = generateMoves(
			boardArray,
			turn,
			castlingRights,
			enPassantTarget,
			halfMoveClock,
			fullMoveClock,
			threatMoveList
		));
	$: if ($moveHistory.length > 0)
		$moveHistory[$moveHistory.length - 1].threatListToOpponent = threatMoveList;

	$: if (halfMoveClock >= 100) alert('draw');
	$: if (moveList.length === 0) {
		if (threatMoveList.some((move) => Piece.isType(boardArray.get(move.target)!, PieceType.King))) {
			alert(turn + ' is lost');
			$moveHistory[$moveHistory.length - 1].isCheckMate = true;
		} else {
			alert('draw');
		}
	}

	const threeFoldCheck = () => {
		console.log('AY');
		if (boardArrayHistory.length >= 10) boardArrayHistory.shift();

		boardArrayHistory = [...boardArrayHistory, [boardArray, castlingRights, enPassantTarget]];

		if (isThreefoldRepetition(boardArrayHistory)) alert('Threefold draw');
	};

	// $: turn, boardArray, moveList, moveRandomly()

	const moveRandomly = () => {
		setTimeout(() => {
			let selectedMove = moveList[Math.floor(Math.random() * moveList.length)];

			console.log('executed', selectedMove.start, selectedMove.target);
			move(selectedMove);
		}, 100);
	};

	const pickPiece = (pieceNumber: number) => {
		resolve(pieceNumber);
		piecePickerIsOpen = false;
	};

	let resolve: (pieceNumber: number) => void;
	let reject: () => void;

	const openPickerOverlay = (tileNumber: number) => {
		return new Promise<number>((res, rej) => {
			piecePickerIsOpen = true;
			topOffset = Piece.getRank(tileNumber);
			leftOffset = Piece.getFile(tileNumber);

			resolve = res;
			reject = rej;
		});
	};

	// Move fn
	const move = async (move: Move) => {
		selectedTile = -1

		let { start: startTile, target: targetTile, note } = move;

		console.log('MOVED ONCE');

		let friendlyColor: Color = boardArray.get(selectedTile)! < 16 ? 'White' : 'Black';
		/* -------------------------------------------------------------------------- */
		/*                                  Promotion                                 */
		/* -------------------------------------------------------------------------- */
		let endOfLine = friendlyColor === 'White' ? 0 : 7;

		let pickedPiece: number | undefined;

		if (
			Piece.getRank(targetTile) === endOfLine &&
			Piece.isType(boardArray.get(startTile)!, PieceType.Pawn)
		) {
			try {
				move.note = 'promote';
				pickedPiece = await openPickerOverlay(targetTile);
			} catch {
				// Cancel out movement entirely
				return;
			}
		}

		let {
			newBoardArray,
			newCastlingRights,
			newEnPassantTarget,
			newTurn,
			newHalfMoveClock,
			newFullMoveClock
		} = executeMove(
			boardArray,
			move,
			turn,
			castlingRights,
			enPassantTarget,
			halfMoveClock,
			fullMoveClock,
			pickedPiece
		);

		console.log('surprise ', newCastlingRights);

		setTimeout(() => {
			lastMove = [startTile, targetTile];
		},400)

		$moveHistory = [
			...$moveHistory,
			{
				newBoardArray,
				newTurn,
				newCastlingRights,
				newEnPassantTarget,
				newHalfMoveClock,
				newFullMoveClock,
				lastMove: [startTile, targetTile],
				turn,
				startTile: move.start,
				targetTile: move.target,
				note: move.note,
				pieceToMove: boardArray.get(startTile)!,
				pieceTarget: boardArray.get(targetTile)!,
				moveList: [...moveList],
				// Leaving this to sideeffect
				threatListToOpponent: [],
				isCheckMate: false,
				pickedPiece
			}
		];

		$boardLookup = { current: $boardLookup.current + 1, lookup: $boardLookup.lookup + 1 };

		enPassantTarget = newEnPassantTarget;

		selectedTile = -1;

		halfMoveClock = newHalfMoveClock;

		fullMoveClock = newFullMoveClock;

		turn = newTurn;

		castlingRights = newCastlingRights;

		boardArray = new Map(newBoardArray);
	};

	$: threatMoveList, console.log('threatMoveList', threatMoveList);
	$: moveList, console.log('moveList', moveList);

	// $: if(turn === "Black")moveRandomly()
</script>

<ProfileSection />
{#if $boardLookup.current === $boardLookup.lookup}
	<Board>
		<div class="absolute inset-0 grid grid-cols-8 grid-rows-8" id="board">
			{#each boardToUse as tile (tile.uniqueId)}
			
				<div class="w-full aspect-square relative" 
					in:receive={{ key: tile.piece, duration: 200 }}
					out:send={{ key: tile.piece, duration: 200 }}
					animate:flip={{ duration: 200 }}
					> 
					<Tile 
						pieceNumber={tile.piece}
						highlightLastMove={lastMove.some((e) => e === tile.id)}
						highlightForMoveSuggestion={!!moveList.find(
							(move) => move.start === selectedTile && move.target === tile.id
						)}
						highlightSelectedTile={selectedTile === tile.id}
						on:click={() => {
							let moveToUse = moveList.find(
								(move) => move.start === selectedTile && move.target === tile.id
							);
							if (!!moveToUse) move(moveToUse);
							else if (tile.piece !== 0) selectedTile = tile.id;
							else selectedTile = -1;
						}}
						on:drop={() => {
							let moveToUse = moveList.find(
								(move) => move.start === selectedTile && move.target === tile.id
							);
							if (!!moveToUse) move(moveToUse);
						}}
						on:dragend={() => (selectedTile = -1)}
						on:dragstart={() => (selectedTile = tile.id)}
						turn={turn}
						highlightCheck={isCheck === tile.id}
						debugIndex={tile.id}
					/>
				</div>
			
			{/each}
		</div>

		<!-- {#if } -->
		<div
			class="absolute top-0 left-0 bg-slate-800/60 inset-0 z-30"
			class:hidden={!piecePickerIsOpen}
			slot="picker"
		>
			<div
				class="piecePicker bg-slate-300 flex flex-col items-center justify-between absolute w-[10vh] h-[40vh]"
				style="top:calc({topOffset} * 10vh);left:calc({leftOffset} * 10vh)"
			>
				<!-- svelte-ignore a11y-click-events-have-key-events -->

				<button on:click={() => pickPiece(PieceType.Queen + PieceColor[turn])} class="w-4/5">
					<img
						src={`/pawn_default/${PieceType.Queen + PieceColor[turn]}.svg`}
						class="select-none w-full z-20 cursor-pointer"
						alt=""
					/>
				</button>

				<button on:click={() => pickPiece(PieceType.Knight + PieceColor[turn])} class="w-4/5">
					<img
						src={`/pawn_default/${PieceType.Knight + PieceColor[turn]}.svg`}
						class="select-none w-full z-20 cursor-pointer"
						alt=""
					/>
				</button>

				<button on:click={() => pickPiece(PieceType.Rook + PieceColor[turn])} class="w-4/5">
					<img
						src={`/pawn_default/${PieceType.Rook + PieceColor[turn]}.svg`}
						class="select-none w-full z-20 cursor-pointer"
						alt=""
					/>
				</button>

				<button on:click={() => pickPiece(PieceType.Bishop + PieceColor[turn])} class="w-4/5">
					<img
						src={`/pawn_default/${PieceType.Bishop + PieceColor[turn]}.svg`}
						class="select-none w-full z-20 cursor-pointer"
						alt=""
					/>
				</button>
			</div>
		</div>

		<div class="absolute top-full text-neutral-50">
			<!-- <div class="font-bold text-2xl">Game param</div>
			{#each boardArrayHistory as aa}
				<li>
					{JSON.stringify([...aa, [...aa[0].entries()].sort()])}
				</li>
				{/each}
			<li>
				Castling rights(KQkq): {JSON.stringify(castlingRights)}
			</li>
			<li>
				En Passant Target: {enPassantTarget}
			</li>
			<li>
				Half Move: {halfMoveClock}
			</li>
			<li>
				Full Move: {fullMoveClock}
			</li> -->
		</div>
	</Board>
{:else}
	<Board>
		<div class="absolute inset-0 grid grid-cols-8 grid-rows-8" id="board">
			{#each boardToUse as {id:index}}
			<div class="w-full aspect-square relative">
				<Tile
					pieceNumber={$moveHistory[$boardLookup.lookup].newBoardArray.get(index)}
					highlightLastMove={$moveHistory[$boardLookup.lookup].lastMove.some((e) => e === index)}
					highlightForMoveSuggestion={false}
					highlightSelectedTile={false}
					turn={$moveHistory[$boardLookup.lookup].turn}
					debugIndex={index}
				/>
			</div>
			{/each}
		</div>
	</Board>
{/if}

<svelte:window on:beforeunload={() => reject?.()} />
