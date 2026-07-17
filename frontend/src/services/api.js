const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5050";

export const getStoredUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch (error) {
    localStorage.removeItem("user");
    return {};
  }
};

export const getCurrentUser = () => {
  const storedUser = getStoredUser();

  return storedUser.user || storedUser;
};

export const getToken = () => {
  const storedUser = getStoredUser();

  return (
    storedUser.token ||
    storedUser.user?.token ||
    ""
  );
};

export const saveUser = (user, token = "") => {
  const savedUser = {
    ...user,
    token:
      token ||
      user.token ||
      getToken()
  };

  localStorage.setItem(
    "user",
    JSON.stringify(savedUser)
  );

  return savedUser;
};

export const clearUser = () => {
  localStorage.removeItem("user");
};

export const apiRequest = async (
  path,
  options = {}
) => {
  const token = getToken();

  const headers = {
    ...options.headers
  };

  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] =
      headers["Content-Type"] ||
      "application/json";
  }

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        headers
      }
    );
  } catch (error) {
    const networkError = new Error(
      "Could not connect to the server."
    );

    networkError.status = 0;
    throw networkError;
  }

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    const requestError = new Error(
      data.message ||
        "Something went wrong."
    );

    requestError.status = response.status;
    requestError.data = data;

    throw requestError;
  }

  return data;
};

export default API_URL;
