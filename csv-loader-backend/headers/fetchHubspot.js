import dotenv from "dotenv";
dotenv.config();
const SECRET = process.env.SECRET;
export function fetchHubspot(method, body = null) {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return options;
}
