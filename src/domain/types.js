// XGOドメイン層で使う基本型と定数（UI非依存）
export const BOARD_SIZE = 9;

export const CellState = {
  Empty: "empty",
  Black: "black",
  White: "white",
  Obstacle: "obstacle",
};

export const Player = {
  Black: "black",
  White: "white",
};

export function otherPlayer(player) {
  return player === Player.Black ? Player.White : Player.Black;
}

export function isOnBoard(point, size = BOARD_SIZE) {
  return (
    point.x >= 0 && point.x < size &&
    point.y >= 0 && point.y < size
  );
}
