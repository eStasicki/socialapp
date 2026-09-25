// Tryb mock: DEV_MODE=true w .env.local. Zablokowany w buildzie produkcyjnym — mockowe konto admin/admin nie może trafić na produkcję.
export const isMock = process.env.DEV_MODE === "true" && process.env.NODE_ENV !== "production";
