const form = document.querySelector("#age-form");
const birthDateInput = document.querySelector("#birth-date");
const message = document.querySelector("#form-message");
const result = document.querySelector("#result");

const today = new Date();
const todayParts = {
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  day: today.getDate(),
};

birthDateInput.max = [
  todayParts.year,
  String(todayParts.month).padStart(2, "0"),
  String(todayParts.day).padStart(2, "0"),
].join("-");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = "";
  result.hidden = true;

  const birthDate = parseDate(birthDateInput.value);
  if (!birthDate) {
    message.textContent = "Pilih tanggal lahir terlebih dahulu.";
    birthDateInput.focus();
    return;
  }

  if (isAfter(birthDate, todayParts)) {
    message.textContent = "Tanggal lahir tidak boleh melewati hari ini.";
    birthDateInput.focus();
    return;
  }

  const age = calculateAge(birthDate, todayParts);
  document.querySelector("#years").textContent = age.years;
  document.querySelector("#months").textContent = age.months;
  document.querySelector("#days").textContent = age.days;
  document.querySelector("#birth-summary").textContent =
    `Lahir ${new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(createUTCDate(birthDate.year, birthDate.month - 1, birthDate.day))}.`;
  result.hidden = false;
});

function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = { year, month, day };
  const parsed = createUTCDate(year, month - 1, day);
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function isAfter(first, second) {
  return (
    first.year > second.year ||
    (first.year === second.year && first.month > second.month) ||
    (first.year === second.year &&
      first.month === second.month &&
      first.day > second.day)
  );
}

function calculateAge(birthDate, currentDate) {
  let totalMonths =
    (currentDate.year - birthDate.year) * 12 + currentDate.month - birthDate.month;
  let anniversary = addMonths(birthDate, totalMonths);

  if (isAfter(anniversary, currentDate)) {
    totalMonths -= 1;
    anniversary = addMonths(birthDate, totalMonths);
  }

  const currentTimestamp = createUTCDate(
    currentDate.year,
    currentDate.month - 1,
    currentDate.day,
  ).getTime();
  const anniversaryTimestamp = createUTCDate(
    anniversary.year,
    anniversary.month - 1,
    anniversary.day,
  ).getTime();
  const days = (currentTimestamp - anniversaryTimestamp) / 86_400_000;

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days,
  };
}

function addMonths(date, months) {
  const monthIndex = date.month - 1 + months;
  const year = date.year + Math.floor(monthIndex / 12);
  const month = (monthIndex % 12) + 1;
  const daysInMonth = createUTCDate(year, month, 0).getUTCDate();
  return { year, month, day: Math.min(date.day, daysInMonth) };
}

function createUTCDate(year, monthIndex, day) {
  const date = new Date(0);
  date.setUTCFullYear(year, monthIndex, day);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}
