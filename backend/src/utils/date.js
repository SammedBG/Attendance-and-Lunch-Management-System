const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export const getIstNow = (date = new Date()) => new Date(date.getTime() + IST_OFFSET_MS);

export const getUtcDateOnlyFromDateString = (dateString) => {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(Date.UTC(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth(),
    parsed.getUTCDate()
  ));
};

export const getUtcDayRangeFromDateString = (dateString) => {
  const start = getUtcDateOnlyFromDateString(dateString);
  if (!start) {
    return null;
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

export const getUtcDayRangeForIstDate = (date = new Date()) => {
  const ist = getIstNow(date);
  const start = new Date(Date.UTC(
    ist.getUTCFullYear(),
    ist.getUTCMonth(),
    ist.getUTCDate()
  ));

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};
