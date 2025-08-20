export default function getAPIUrl() {
  const apiUrl = "http://localhost:3002/api";

  const API_URL = process.env.REACT_APP_API_URL;
console.log("API", API_URL, process.env)
  return apiUrl;
}
