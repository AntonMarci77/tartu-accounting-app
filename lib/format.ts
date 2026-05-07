// European number/date formatting helpers.
// Numbers: 122,22 (comma decimal). Dates: DD/MM/YY input, ISO storage.

export function formatEUR(amount: number | string | null | undefined, withCurrency = true): string {
  if (amount === null || amount === undefined || amount === "") return "";
  const n = typeof amount === "string" ? parseEUR(amount) : amount;
  if (!Number.isFinite(n)) return "";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const whole = Math.floor(abs).toString();
  const cents = Math.round((abs - Math.floor(abs)) * 100).toString().padStart(2, "0");
  // Add space as thousand separator
  const wholeFmt = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${sign}${wholeFmt},${cents}${withCurrency ? " EUR" : ""}`;
}

export function parseEUR(s: string | number): number {
  if (typeof s === "number") return s;
  if (!s) return 0;
  const cleaned = s
    .replace(/\s| /g, "")
    .replace(/EUR/gi, "")
    .replace(/€/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

// "DD/MM/YY" or "DD/MM/YYYY" → ISO "YYYY-MM-DD"
export function parseEUDate(s: string): string {
  if (!s) return "";
  const trimmed = s.trim();
  // Already ISO?
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const m = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (!m) return "";
  let [, d, mo, y] = m;
  if (y.length === 2) y = (parseInt(y, 10) > 70 ? "19" : "20") + y;
  const dd = d.padStart(2, "0");
  const mm = mo.padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

// ISO "YYYY-MM-DD" → "DD/MM/YY"
export function formatEUDate(iso: string, fourDigitYear = false): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const [, y, mo, d] = m;
  return `${d}/${mo}/${fourDigitYear ? y : y.slice(2)}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
