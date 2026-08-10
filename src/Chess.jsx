import React, { useState } from "react";
import { Chess } from "chess.js";

const pieces = {
  w: {
    k: "♔",
    q: "♕",
    r: "♖",
    b: "♗",
    n: "♘",
    p: "♙",
  },
  b: {
    k: "♚",
    q: "♛",
    r: "♜",
    b: "♝",
    n: "♞",
    p: "♟",
  },
};

export default function ChessGame({ onWin }) {
  const [game, setGame] = useState(() => new Chess());
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("White to move");

  const board = game.board();

  const legalMoves = selected
    ? game.moves({
        square: selected,
        verbose: true,
      }).map((move) => move.to)
    : [];

  function clickSquare(row, col) {
    const file = String.fromCharCode(97 + col);
    const rank = 8 - row;
    const square = file + rank;

    const piece = board[row][col];

    // Select/move a piece
    if (selected) {
      if (legalMoves.includes(square)) {
        const movingPiece = game.get(selected);

        let promotion = "q";

        // Pawn promotion
        if (
          movingPiece?.type === "p" &&
          (square.endsWith("8") || square.endsWith("1"))
        ) {
          const choice = window.prompt(
            "Promote to: q = Queen, r = Rook, b = Bishop, n = Knight",
            "q"
          );

          promotion = (choice || "q").toLowerCase();

          if (!["q", "r", "b", "n"].includes(promotion)) {
            promotion = "q";
          }
        }

        try {
          game.move({
            from: selected,
            to: square,
            promotion,
          });

          setGame(new Chess(game.fen()));
          setSelected(null);

          if (game.isCheckmate()) {
            const winner = game.turn() === "w" ? "Black" : "White";

            setMessage(`${winner} wins by checkmate!`);

            if (winner === "White") {
              onWin?.();
            }
          } else if (game.isDraw() || game.isStalemate()) {
            setMessage("Draw!");
          } else {
            setMessage(
              `${game.turn() === "w" ? "White" : "Black"} to move${
                game.inCheck() ? " • Check!" : ""
              }`
            );
          }

          return;
        } catch (error) {
          console.log(error);
        }
      }

      // Select another own piece
      if (piece && piece.color === game.turn()) {
        setSelected(square);
        return;
      }

      setSelected(null);
      return;
    }

    // Select own piece
    if (piece && piece.color === game.turn()) {
      setSelected(square);
    }
  }

  function resetGame() {
    setGame(new Chess());
    setSelected(null);
    setMessage("White to move");
  }

  return (
    <div className="game-card chess-card">
      <div className="game-head">
        <div>
          <h2>♟️ Chess</h2>
          <p>{message}</p>
        </div>

        <button onClick={resetGame}>New Game</button>
      </div>

      <div className="chess-board">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const square =
              String.fromCharCode(97 + colIndex) + (8 - rowIndex);

            const isLight =
              (rowIndex + colIndex) % 2 === 0;

            const isSelected = selected === square;
            const isLegal = legalMoves.includes(square);

            return (
              <button
                key={square}
                className={`chess-square ${
                  isLight ? "light" : "dark"
                } ${isSelected ? "selected" : ""} ${
                  isLegal ? "legal" : ""
                }`}
                onClick={() => clickSquare(rowIndex, colIndex)}
              >
                {piece && (
                  <span
                    className={
                      piece.color === "w"
                        ? "white-piece"
                        : "black-piece"
                    }
                  >
                    {pieces[piece.color][piece.type]}
                  </span>
                )}

                {isLegal && !piece && <i />}
                {isLegal && piece && <em />}
              </button>
            );
          })
        )}
      </div>

      <p className="chess-note">
        Tap a piece, then tap its destination.
      </p>
    </div>
  );
}
