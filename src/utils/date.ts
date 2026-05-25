const isoLikeDateRegex =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?(?:\s*(Z|[+-]\d{2}:\d{2}))?$/;

const parseIsoLikeDate = (value: string) => {
  const normalized = value.trim();
  const match = normalized.match(isoLikeDateRegex);

  if (!match) return null;

  const [, year, month, day, hour = "0", minute = "0", second = "0", millisecond = "0", timeZone = ""] = match;

  return {
    normalized,
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
    millisecond: Number(millisecond.padEnd(3, "0")),
    timeZone,
    hasExplicitTimeZone: Boolean(timeZone)
  };
};

export const parseApiDate = (value: string) => {
  if (!value) return null;

  const parsedIso = parseIsoLikeDate(value);

  if (parsedIso) {
    if (parsedIso.hasExplicitTimeZone) {
      const normalizedWithOffset =
        `${String(parsedIso.year).padStart(4, "0")}-${String(parsedIso.month).padStart(2, "0")}-${String(parsedIso.day).padStart(2, "0")}` +
        `T${String(parsedIso.hour).padStart(2, "0")}:${String(parsedIso.minute).padStart(2, "0")}:${String(parsedIso.second).padStart(2, "0")}` +
        `${parsedIso.millisecond ? `.${String(parsedIso.millisecond).padStart(3, "0")}` : ""}` +
        `${parsedIso.timeZone}`;
      const offsetParsed = new Date(normalizedWithOffset);
      return Number.isNaN(offsetParsed.getTime()) ? null : offsetParsed;
    }

    return new Date(
      parsedIso.year,
      parsedIso.month - 1,
      parsedIso.day,
      parsedIso.hour,
      parsedIso.minute,
      parsedIso.second,
      parsedIso.millisecond
    );
  }

  const parsed = new Date(value.trim());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDateTimeEsAr = (value: string) => {
  const parsedIso = parseIsoLikeDate(value);

  if (parsedIso) {
    return `${parsedIso.day}/${parsedIso.month}/${parsedIso.year}, ${String(parsedIso.hour).padStart(2, "0")}:${String(parsedIso.minute).padStart(2, "0")}:${String(parsedIso.second).padStart(2, "0")}`;
  }

  const parsed = parseApiDate(value);
  return parsed ? parsed.toLocaleString("es-AR", { hour12: false }) : "-";
};

export const formatDateEsAr = (value: string) => {
  const parsedIso = parseIsoLikeDate(value);

  if (parsedIso) {
    return `${parsedIso.day}/${parsedIso.month}/${parsedIso.year}`;
  }

  const parsed = parseApiDate(value);
  return parsed ? parsed.toLocaleDateString("es-AR") : "-";
};

export const compareApiDateStrings = (left: string, right: string) => {
  const leftIso = parseIsoLikeDate(left);
  const rightIso = parseIsoLikeDate(right);

  if (leftIso && rightIso) {
    const leftKey = Number(
      `${leftIso.year}${String(leftIso.month).padStart(2, "0")}${String(leftIso.day).padStart(2, "0")}${String(leftIso.hour).padStart(2, "0")}${String(leftIso.minute).padStart(2, "0")}${String(leftIso.second).padStart(2, "0")}${String(leftIso.millisecond).padStart(3, "0")}`
    );
    const rightKey = Number(
      `${rightIso.year}${String(rightIso.month).padStart(2, "0")}${String(rightIso.day).padStart(2, "0")}${String(rightIso.hour).padStart(2, "0")}${String(rightIso.minute).padStart(2, "0")}${String(rightIso.second).padStart(2, "0")}${String(rightIso.millisecond).padStart(3, "0")}`
    );
    return leftKey - rightKey;
  }

  return (parseApiDate(left)?.getTime() ?? 0) - (parseApiDate(right)?.getTime() ?? 0);
};
