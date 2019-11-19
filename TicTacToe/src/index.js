import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
function Square(props) {
  const className = 'square' + (props.highlight ? ' highlight' : '');
  return (
    <button
      className={className}
      onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winLine = this.props.winLine;
  return (
    <Square
      key={i}
      value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)}
      highlight={winLine && winLine.includes(i)}
      />
    );
  }

  render() {
    const boardSize = 4;
    let squares = [];
    for(let i=0; i<boardSize; ++i) {
      let row = [];
      for(let j=0; j<boardSize; ++j) {
        row.push(this.renderSquare(i * boardSize + j));
      }
      squares.push(<div key={i} className="board-row">{row}</div>);
    }

    return (
      <div>{squares}</div>
     );
   }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(16).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      ascendingOrder: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          latestMoveSquare: i
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  handleSortToggle() {
    this.setState({
      ascendingOrder: !this.state.ascendingOrder
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winInfo = calculateWinner(current.squares);
    const winner = winInfo.winner;
    const ascendingOrder = this.state.ascendingOrder;

    const moves = history.map((step, move) => {
    const latestMoveSquare = step.latestMoveSquare;
    const col = 1 + latestMoveSquare % 3;
    const row = 1 + Math.floor(latestMoveSquare / 3);
    const desc = move ?
      `Go to move #${move} (${col}, ${row})` :
      'Go to game start';
      return (
      <li key={move}>
        <button
          className={move === this.state.stepNumber ? 'move-list-item-selected' : ''}
          onClick={() => this.jumpTo(move)}>{desc}
        </button>
      </li>
      );
    });
    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      if (winInfo.isDraw) {
      status = "Draw";
      }
      else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
    }
    if (!ascendingOrder) {
      moves.reverse();
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            winLine={winInfo.line}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
            <button onClick={() => this.handleSortToggle()}>
              {ascendingOrder ? 'descending' : 'ascending'}
            </button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}


// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
    [0, 4, 8, 12],
    [1, 5, 8, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    [0, 5, 10, 15],
    [3, 6, 9, 12]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c,d] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]&& squares[a] === squares[d]) {
      return {
      winner:squares[a],
      line: lines[i],
      isDraw: false
    };
    }
  }
  let isDraw = true;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      isDraw = false;
      break;
    }
  }
  return {
    winner: null,
    line: null,
    isDraw: isDraw
  };
}
