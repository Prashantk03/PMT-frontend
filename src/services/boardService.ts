const API_URI = "http://localhost:3000/boards";

export const fetchBoards = async (token: string) => {
  const res = await fetch(API_URI, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch boards");
  return res.json();
};

export const createBoard = async (title: string, token: string) => {
  const res = await fetch(API_URI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });
  return res.json();
};
