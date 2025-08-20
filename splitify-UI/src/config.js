const VITE_API_URL = import.meta.env.VITE_API_URL;

export default function getAPIUrl() {
  const apiUrl = VITE_API_URL;

  // const API_URL = process.env.REACT_APP_API_URL;
  return apiUrl;
}
