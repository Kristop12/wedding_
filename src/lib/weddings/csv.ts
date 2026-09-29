export type ParsedGuest = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

export type ParsedParty = {
  name: string;
  maxGuests: number;
  groupName: string | null;
  members: ParsedGuest[];
};

export type CsvResult =
  | { ok: true; parties: ParsedParty[] }
  | { ok: false; message: string };

const HEADER = ["party", "maxguests", "group", "firstname", "lastname", "email", "phone"];

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && source[index + 1] === "\n") {
        index += 1;
      }
      row.push(cell.trim());
      cell = "";
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }
    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((value) => value.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

export function parseGuestCsv(text: string): CsvResult {
  const rows = parseCsvRows(text);
  if (rows.length < 2) {
    return { ok: false, message: "The CSV needs a header row and at least one guest." };
  }
  if (rows.length > 201) {
    return { ok: false, message: "Import 200 guests or fewer at a time." };
  }

  const header = rows[0].map((value) => value.toLowerCase().replace(/[\s_-]/g, ""));
  const indexes = HEADER.map((name) => header.indexOf(name));
  if (indexes.slice(0, 5).some((index) => index < 0)) {
    return {
      ok: false,
      message: "Use the columns party, maxGuests, group, firstName, lastName, email, and phone.",
    };
  }

  const parties = new Map<string, ParsedParty>();

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const value = (column: number) => row[indexes[column]]?.trim() ?? "";
    const partyName = value(0);
    const maxGuests = Number(value(1));
    const groupName = value(2);
    const firstName = value(3);
    const lastName = value(4);
    const email = value(5);
    const phone = value(6);
    const line = rowIndex + 1;

    if (!partyName || !firstName || !lastName) {
      return { ok: false, message: `Row ${line} needs a party, first name, and last name.` };
    }
    if (!Number.isInteger(maxGuests) || maxGuests < 1 || maxGuests > 20) {
      return { ok: false, message: `Row ${line} needs a seat count from 1 to 20.` };
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, message: `Row ${line} has an invalid email.` };
    }

    const key = partyName.toLowerCase();
    const existing = parties.get(key);
    if (!existing) {
      parties.set(key, {
        name: partyName,
        maxGuests,
        groupName: groupName || null,
        members: [],
      });
    } else if (existing.maxGuests !== maxGuests) {
      return {
        ok: false,
        message: `Party "${partyName}" uses more than one seat count.`,
      };
    }

    const party = parties.get(key);
    if (!party) {
      continue;
    }
    party.members.push({
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
    });
    if (party.members.length > party.maxGuests) {
      return {
        ok: false,
        message: `"${partyName}" has more guests than the allowed seats.`,
      };
    }
  }

  return { ok: true, parties: [...parties.values()] };
}
