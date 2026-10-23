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
  const zodiac = getZodiac(birthDate.month, birthDate.day);
  document.querySelector("#zodiac-name").textContent = zodiac.name;
  document.querySelector("#zodiac-period").textContent = zodiac.period;
  const pawukon = getPawukon(birthDate);
  document.querySelector("#pawukon-day").textContent =
    `${pawukon.saptawara} ${pawukon.pancawara}`;
  document.querySelector("#pawukon-wuku").textContent = `Wuku ${pawukon.wuku}`;
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

function getZodiac(month, day) {
  const signs = [
    { name: "Aquarius", period: "20 Jan – 18 Feb", start: [1, 20] },
    { name: "Pisces", period: "19 Feb – 20 Mar", start: [2, 19] },
    { name: "Aries", period: "21 Mar – 19 Apr", start: [3, 21] },
    { name: "Taurus", period: "20 Apr – 20 Mei", start: [4, 20] },
    { name: "Gemini", period: "21 Mei – 20 Jun", start: [5, 21] },
    { name: "Cancer", period: "21 Jun – 22 Jul", start: [6, 21] },
    { name: "Leo", period: "23 Jul – 22 Agu", start: [7, 23] },
    { name: "Virgo", period: "23 Agu – 22 Sep", start: [8, 23] },
    { name: "Libra", period: "23 Sep – 22 Okt", start: [9, 23] },
    { name: "Scorpio", period: "23 Okt – 21 Nov", start: [10, 23] },
    { name: "Sagittarius", period: "22 Nov – 21 Des", start: [11, 22] },
    { name: "Capricorn", period: "22 Des – 19 Jan", start: [12, 22] },
  ];

  for (let index = signs.length - 1; index >= 0; index -= 1) {
    const [startMonth, startDay] = signs[index].start;
    if (month > startMonth || (month === startMonth && day >= startDay)) {
      return signs[index];
    }
  }
  return signs[signs.length - 1];
}

function getPawukon(date) {
  const julianDay =
    date.day +
    Math.floor((153 * (date.month + 12 * Math.floor((14 - date.month) / 12) - 3) + 2) / 5) +
    365 * (date.year + 4800 - Math.floor((14 - date.month) / 12)) +
    Math.floor((date.year + 4800 - Math.floor((14 - date.month) / 12)) / 4) -
    Math.floor((date.year + 4800 - Math.floor((14 - date.month) / 12)) / 100) +
    Math.floor((date.year + 4800 - Math.floor((14 - date.month) / 12)) / 400) -
    32045;
  // The Pawukon cycle uses JDN 146 as day zero.
  const cycleDay = ((julianDay - 146) % 210 + 210) % 210;
  const saptawara = [
    "Redite",
    "Soma",
    "Anggara",
    "Buda",
    "Wraspati",
    "Sukra",
    "Saniscara",
  ];
  const pancawara = ["Umanis", "Paing", "Pon", "Wage", "Kliwon"];
  const wuku = [
    "Sinta",
    "Landep",
    "Ukir",
    "Kulantir",
    "Tolu",
    "Gumbreg",
    "Wariga",
    "Warigadean",
    "Julungwangi",
    "Sungsang",
    "Dungulan",
    "Kuningan",
    "Langkir",
    "Medangsia",
    "Pujut",
    "Pahang",
    "Krulut",
    "Merakih",
    "Tambir",
    "Medangkungan",
    "Matal",
    "Uye",
    "Menail",
    "Prangbakat",
    "Bala",
    "Ugu",
    "Wayang",
    "Kelawu",
    "Dukut",
    "Watugunung",
  ];

  return {
    saptawara: saptawara[cycleDay % 7],
    pancawara: pancawara[(cycleDay + 1) % 5],
    wuku: wuku[Math.floor(cycleDay / 7)],
  };
}
