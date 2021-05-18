import { host } from "./constants";

export const login = async (authData) => {
  const res = await fetch(`${host}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: authData.email,
      password: authData.password,
    }),
  });
  if (res.status === 422) {
    throw new Error("Validation failed.");
  }
  if (res.status !== 200 && res.status !== 201) {
    console.log("Error!");
    throw new Error("Could not authenticate you!");
  }
  return await res.json();
};

export const signup = async (authData) => {
  const res = await fetch(`${host}/auth/signup`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: authData.signupForm.email.value,
      password: authData.signupForm.password.value,
      name: authData.signupForm.name.value,
    }),
  });
  if (res.status === 422) {
    throw new Error(
      "Validation failed. Make sure the email address isn't used yet!"
    );
  }
  if (res.status !== 200 && res.status !== 201) {
    console.log("Error!");
    throw new Error("Creating a user failed!");
  }
  return await res.json();
};

export const getStatus = async (token) => {
  const res = await fetch(`${host}/auth/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status !== 200) {
    throw new Error("Failed to fetch user status.");
  }
  return await res.json();
};

export const updateStatus = async (token, newStatus) => {
  const res = await fetch(`${host}/auth/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: newStatus }),
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error("Can't update status!");
  }
  return await res.json();
};
