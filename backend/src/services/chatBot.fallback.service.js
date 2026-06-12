const {
  getRoomQuote,
  normalizeRoomCode,
  formatVnd,
  normalizeCity,
  SUPPORTED_CITIES,
} = require('./chatBot.tools.service');

const GENERIC_FALLBACK = 'Xin lỗi, tôi chưa trả lời được. Bạn thử hỏi lại nhé.';

const OCCUPANCY_LABEL = {
  available: 'còn trống',
  booked: 'đã được đặt',
  held: 'đang được giữ chỗ',
  inactive: 'tạm ngưng',
  dates_not_provided: 'chưa kiểm tra theo ngày',
};

function stripDiacritics(raw) {
  return String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function extractRoomCode(message) {
  const text = String(message || '');
  const labeled = text.match(/phòng\s+([A-Za-z]{2,}-\d{2,4})/i);
  if (labeled) return normalizeRoomCode(labeled[1]);
  const inline = text.match(/\b([A-Za-z]{2,}-\d{2,4})\b/);
  return inline ? normalizeRoomCode(inline[1]) : null;
}

function extractCityHint(message) {
  const text = String(message || '');
  for (const city of SUPPORTED_CITIES) {
    if (stripDiacritics(text).includes(stripDiacritics(city))) return city;
  }
  return null;
}

function extractBranchHint(message) {
  const match = String(message || '').match(/chi nhánh\s+([^·,\n]+)/i);
  return match ? match[1].trim() : null;
}

function inferDatesFromMessage(message, todayIso = new Date().toISOString().slice(0, 10)) {
  const text = String(message || '');
  const [defaultYear, defaultMonth] = todayIso.split('-');

  const full = text.match(
    /(\d{1,2})\s*[-–]\s*(\d{1,2})\s*[/]\s*(\d{1,2})(?:\s*[/]\s*(\d{4}))?/,
  );
  if (full) {
    const year = full[4] || defaultYear;
    const month = String(full[3]).padStart(2, '0');
    const checkIn = `${year}-${month}-${String(full[1]).padStart(2, '0')}`;
    const checkOut = `${year}-${month}-${String(full[2]).padStart(2, '0')}`;
    if (checkOut > checkIn) return { checkIn, checkOut };
  }

  const monthWord = text.match(
    /(\d{1,2})\s*[-–]\s*(\d{1,2})\s*tháng\s*(\d{1,2})/i,
  );
  if (monthWord) {
    const year = defaultYear;
    const month = String(monthWord[3]).padStart(2, '0');
    const checkIn = `${year}-${month}-${String(monthWord[1]).padStart(2, '0')}`;
    const checkOut = `${year}-${month}-${String(monthWord[2]).padStart(2, '0')}`;
    if (checkOut > checkIn) return { checkIn, checkOut };
  }

  const simple = text.match(/(?:ngày\s+)?(\d{1,2})\s*[-–]\s*(\d{1,2})(?!\s*[/])/i);
  if (simple) {
    const checkIn = `${defaultYear}-${defaultMonth}-${String(simple[1]).padStart(2, '0')}`;
    const checkOut = `${defaultYear}-${defaultMonth}-${String(simple[2]).padStart(2, '0')}`;
    if (checkOut > checkIn) return { checkIn, checkOut };
  }

  return null;
}

function nightsBetween(checkIn, checkOut) {
  const a = new Date(`${checkIn}T12:00:00`);
  const b = new Date(`${checkOut}T12:00:00`);
  const nights = Math.round((b.getTime() - a.getTime()) / 86400000);
  return nights > 0 ? nights : null;
}

function formatDateRange(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '';
  const fmt = (iso) => {
    const [, m, d] = iso.split('-');
    return `${Number(d)}/${Number(m)}`;
  };
  return `từ ${fmt(checkIn)}–${fmt(checkOut)}`;
}

function roomCodesMatch(queryCode, actualCode) {
  const q = normalizeRoomCode(queryCode);
  const a = normalizeRoomCode(actualCode);
  if (q === a) return true;
  const qNum = q.split('-').pop();
  const aNum = a.split('-').pop();
  return Boolean(qNum && aNum && qNum === aNum);
}

function findRoomInBranchStatus(result, roomCode) {
  if (!result?.rooms?.length || !roomCode) return null;
  return result.rooms.find((r) => roomCodesMatch(roomCode, r.code)) || null;
}

function pickToolDates(toolsUsed) {
  for (let i = toolsUsed.length - 1; i >= 0; i -= 1) {
    const args = toolsUsed[i]?.args || {};
    if (args.checkIn && args.checkOut) {
      return { checkIn: args.checkIn, checkOut: args.checkOut };
    }
  }
  return null;
}

function formatQuoteReply(quote, { checkIn, checkOut } = {}) {
  const occupancy = quote.occupancy || 'dates_not_provided';
  const statusLabel = OCCUPANCY_LABEL[occupancy] || occupancy;
  const dateRange = formatDateRange(checkIn || quote.checkIn, checkOut || quote.checkOut);
  const nights = quote.nights ?? (
    checkIn && checkOut ? nightsBetween(checkIn, checkOut) : null
  );

  const lines = [
    `**${quote.roomCode}** · ${quote.branchName} (${quote.propertyName})`,
    `Giá: **${quote.priceLabel}/đêm**`,
  ];

  if (dateRange) {
    lines.push(`Khoảng ${dateRange}: **${statusLabel}**`);
    if (occupancy === 'inactive') {
      lines.push('Phòng này **tạm ngừng** — không nhận đặt mới. Bạn thử phòng khác hoặc chi nhánh khác nhé.');
    } else if (occupancy === 'booked' || occupancy === 'held') {
      lines.push(
        'Phòng này không còn trống trong khoảng ngày bạn hỏi — bạn có thể chọn phòng khác hoặc đổi ngày.',
      );
    }
    if (nights && occupancy === 'available') {
      const total = quote.totalLabel || formatVnd(quote.priceVnd * nights);
      lines.push(`Ước tính ${nights} đêm: **${total}**`);
    }
  } else {
    lines.push(`Trạng thái: ${statusLabel}.`);
    if (occupancy === 'inactive') {
      lines.push('Phòng **tạm ngừng** — không nhận đặt mới.');
    } else {
      lines.push('Cho mình biết ngày nhận/trả để kiểm tra còn trống nhé.');
    }
  }

  if (quote.bookingUrl && occupancy !== 'inactive') {
    lines.push(`Đặt phòng: ${quote.bookingUrl}`);
  }

  return lines.join('\n');
}

function formatToolErrorReply(result) {
  if (!result?.error) return null;
  const msg = String(result.message || result.error || '');
  if (/pool timeout|can't reach database|mysql|mariadb|db unavailable/i.test(msg)) {
    return 'Hệ thống tạm không đọc được dữ liệu phòng. Bạn thử lại sau vài giây nhé.';
  }
  if (result.error === 'city_not_supported') {
    return result.message || 'Thành phố này chưa có cơ sở Cherry House.';
  }
  if (result.error === 'invalid_dates') {
    return result.message || 'Ngày trả phòng phải sau ngày nhận phòng.';
  }
  if (result.error === 'property_inactive' || result.error === 'branch_inactive' || result.error === 'room_inactive') {
    return result.message || 'Địa điểm này tạm ngừng nhận đặt phòng mới.';
  }
  if (result.error === 'property_not_found') {
    return result.message || 'Không tìm thấy cơ sở.';
  }
  if (result.error === 'branch_not_found') {
    return result.message || 'Không tìm thấy chi nhánh.';
  }
  if (result.error === 'city_inactive_only') {
    return result.message || 'Thành phố này tạm không có cơ sở đang hoạt động.';
  }
  if (result.error === 'room_not_found') {
    const suggestions = Array.isArray(result.similarCodes) && result.similarCodes.length
      ? ` Gợi ý mã gần đúng: ${result.similarCodes.join(', ')}.`
      : '';
    return `${result.message || 'Không tìm thấy phòng.'}${suggestions}`;
  }
  if (result.error === 'ambiguous_room') {
    const options = (result.matches || [])
      .map((m) => `${m.roomCode} (${m.branchName})`)
      .join(', ');
    return `${result.message || 'Mã phòng không rõ chi nhánh.'}${options ? ` Gợi ý: ${options}.` : ''}`;
  }
  return null;
}

function summarizeSearchFallback(result, roomCode) {
  if (!result?.rooms?.length) {
    if (roomCode) return null;
    if (result?.error === 'city_inactive_only') return result.message;
    return result?.datesRequiredNote
      || 'Hiện chưa có phòng trống phù hợp. Bạn thử đổi ngày hoặc thành phố khác nhé.';
  }
  return null;
}

/**
 * Khi Gemini trả rỗng, tự suy diễn từ tool results + câu hỏi user.
 */
async function buildSmartFallbackReply({ message, toolsUsed = [] }) {
  const roomCode = extractRoomCode(message);
  const inferredDates = inferDatesFromMessage(message);
  const toolDates = pickToolDates(toolsUsed);
  const dates = toolDates || inferredDates;

  for (let i = toolsUsed.length - 1; i >= 0; i -= 1) {
    const { name, result } = toolsUsed[i];
    if (!result) continue;

    const toolError = formatToolErrorReply(result);
    if (toolError) return toolError;

    if (name === 'get_branch_room_status' && roomCode) {
      const room = findRoomInBranchStatus(result, roomCode);
      if (room) {
        return formatQuoteReply({
          roomCode: room.code,
          propertyName: result.propertyName,
          branchName: result.branchName,
          priceVnd: room.priceVnd,
          priceLabel: room.priceLabel,
          occupancy: room.occupancy,
          bookingUrl: room.bookingUrl,
          checkIn: dates?.checkIn,
          checkOut: dates?.checkOut,
        }, dates || {});
      }
    }

    if (name === 'get_room_quote' && result && !result.error) {
      return formatQuoteReply(result, dates || {});
    }

    if (name === 'search_available_rooms' && roomCode) {
      const listedRoom = (result.rooms || []).find((r) => roomCodesMatch(roomCode, r.roomCode));
      if (listedRoom) {
        return formatQuoteReply({
          roomCode: listedRoom.roomCode,
          propertyName: listedRoom.propertyName,
          branchName: listedRoom.branchName,
          priceVnd: listedRoom.priceVnd,
          priceLabel: listedRoom.priceLabel,
          occupancy: listedRoom.occupancy || 'available',
          bookingUrl: listedRoom.bookingUrl,
        }, {
          checkIn: dates?.checkIn || result.checkIn,
          checkOut: dates?.checkOut || result.checkOut,
        });
      }

      const quote = await getRoomQuote({
        roomCode,
        city: result.cityResolved || extractCityHint(message),
        branchNameHint: extractBranchHint(message),
        checkIn: dates?.checkIn || result.checkIn,
        checkOut: dates?.checkOut || result.checkOut,
      });
      if (quote && !quote.error) {
        return formatQuoteReply(quote, dates || {});
      }
      const notFound = formatToolErrorReply(quote);
      if (notFound) return notFound;
    }

    if (name === 'search_available_rooms') {
      const summary = summarizeSearchFallback(result, roomCode);
      if (summary) return summary;
    }
  }

  if (roomCode) {
    const quote = await getRoomQuote({
      roomCode,
      city: extractCityHint(message),
      branchNameHint: extractBranchHint(message),
      checkIn: dates?.checkIn,
      checkOut: dates?.checkOut,
    });
    if (quote && !quote.error) {
      return formatQuoteReply(quote, dates || {});
    }
    const notFound = formatToolErrorReply(quote);
    if (notFound) return notFound;
  }

  return null;
}

function needsSmartFallback(reply) {
  const text = String(reply || '').trim();
  return !text || text === GENERIC_FALLBACK;
}

module.exports = {
  GENERIC_FALLBACK,
  buildSmartFallbackReply,
  needsSmartFallback,
  extractRoomCode,
  inferDatesFromMessage,
};
