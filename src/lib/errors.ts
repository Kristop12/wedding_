export class AccessError extends Error {
  readonly code: "UNAUTHORIZED" | "FORBIDDEN";

  constructor(code: "UNAUTHORIZED" | "FORBIDDEN") {
    super(code === "UNAUTHORIZED" ? "Unauthorized" : "Forbidden");
    this.name = "AccessError";
    this.code = code;
  }
}
