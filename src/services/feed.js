import { host } from "./constants";

const uri = `${host}/feed/posts`;

export const saveFeed = async (params) => {
  const { postData, id, token } = params;

  const formData = new FormData();
  formData.append("title", postData.title);
  formData.append("content", postData.content);
  formData.append("image", postData.image);

  let _uri = uri;
  let method = "POST";
  if (id) {
    _uri = `${uri}/${id}`;
    method = "PUT";
  }

  const res = await fetch(_uri, {
    method,
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error("Creating or editing a post failed!");
  }
  return await res.json();
};

export const deleteFeed = async (id, token) => {
  const res = await fetch(`${uri}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error("Deleting a post failed!");
  }
  return await res.json();
};

export const getFeedById = async (id, token) => {
  const res = await fetch(`${uri}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status !== 200) {
    throw new Error("Failed to fetch this post");
  }
  return await res.json();
};

export const getFeeds = async (page, token) => {
  const res = await fetch(`${host}?page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status !== 200) {
    throw new Error("Failed to fetch posts.");
  }
  return await res.json();
};
