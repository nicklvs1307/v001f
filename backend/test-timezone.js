const { formatInTimeZone } = require("./src/utils/dateUtils");

const now = new Date(); // Data atual do sistema
console.log("UTC Time:", now.toISOString());
console.log("SP Hour (HH):", formatInTimeZone(now, "HH"));
console.log("Full SP Time:", formatInTimeZone(now, "yyyy-MM-dd HH:mm:ss"));
