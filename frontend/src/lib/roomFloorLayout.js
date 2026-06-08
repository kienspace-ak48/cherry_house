const COLS = 3;

/**
 * Suy luận tầng từ mã phòng (HN-101 → tầng 1, Q1-305 → tầng 3).
 * @param {string} code
 */
export function inferFloorFromCode(code) {
  const match = String(code).match(/(\d+)/);
  if (!match) return { floor: 1, roomNumber: 0, label: 'Khác' };
  const num = Number(match[1]);
  if (!Number.isFinite(num) || num <= 0) {
    return { floor: 1, roomNumber: 0, label: 'Tầng 1' };
  }
  if (num >= 100) {
    const floor = Math.floor(num / 100);
    return { floor, roomNumber: num, label: `Tầng ${floor}` };
  }
  return { floor: 1, roomNumber: num, label: 'Tầng 1' };
}

/**
 * Nhóm phòng theo tầng, sắp xếp trong từng tầng.
 * @param {Array<{ id: number; code: string }>} rooms
 */
export function groupRoomsByFloor(rooms) {
  const map = new Map();

  for (const room of rooms) {
    const { floor, roomNumber, label } = inferFloorFromCode(room.code);
    const key = floor;
    if (!map.has(key)) {
      map.set(key, { floor, label, rooms: [] });
    }
    map.get(key).rooms.push({ ...room, roomNumber });
  }

  return [...map.values()]
    .sort((a, b) => a.floor - b.floor)
    .map((group) => ({
      ...group,
      rooms: group.rooms.sort((a, b) => {
        if (a.roomNumber !== b.roomNumber) return a.roomNumber - b.roomNumber;
        return String(a.code).localeCompare(String(b.code), 'vi');
      }),
    }));
}

/**
 * Xếp phòng thành lưới 3 cột (kiểu sơ đồ ghế xe).
 * Ô giữa hàng đầu để trống làm hành lang — chỉ khi đủ phòng.
 * @param {Array<object>} rooms
 * @returns {Array<object | null>}
 */
export function buildFloorGrid(rooms) {
  const cells = [];
  const withCorridor = rooms.length >= 4;

  rooms.forEach((room, index) => {
    if (withCorridor && index === 1) {
      cells.push(null);
    }
    cells.push(room);
  });

  const remainder = cells.length % COLS;
  if (remainder !== 0) {
    for (let i = 0; i < COLS - remainder; i += 1) {
      cells.push(null);
    }
  }

  return cells;
}

export const FLOOR_GRID_COLS = COLS;
