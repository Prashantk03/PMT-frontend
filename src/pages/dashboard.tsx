import { useEffect, useState } from "react";
import { fetchBoards, createBoard } from "../services/boardService";
import { Link } from "react-router-dom";

// Board type
type Board = {
  _id: string;
  title: string;
  description?: string;
  createdBY?: string;
};

// Function
export default function DashBoard() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [title, setTitle] = useState("");

  const token = localStorage.getItem("access_token") || "";

  useEffect(() => {
    fetchBoards(token).then(setBoards).catch(console.error);
  }, []);

  // Create Board
  const handleCreateBoard = async () => {
    const newBoard = await createBoard(title, token);
    setBoards((prev) => [...prev, newBoard]);
    setTitle("");
  };

  // Delete Board
  const handleDeleteBoard = async (boardId: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this board?"
    );
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:3000/boards/${boardId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setBoards((prev) => prev.filter((b) => b._id !== boardId));
      } else {
        console.error("Failed to delete board");
      }
    } catch (error) {
      console.error("Error deleting board:", error);
    }
  };

  //***********************Display**************************/
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Boards</h1>
      <div className="mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Board title"
          className="border px-4 py-2 rounded mr-2"
        />
        <button
          onClick={handleCreateBoard}
          className="bg-violet-600 text-white px-4 py-2 rounded"
        >
          Create Board
        </button>
      </div>

      <ul className="space-y-2">
        {boards.map((board) => (
          <li key={board._id} className="border p-4 rounded shadow">
            <Link
              to={`/board/${board._id}`}
              className="text-violet-700 hover:underline"
            >
              {board.title}
            </Link>
            <button
              onClick={() => handleDeleteBoard(board._id)}
              className="bg-red-600 text-white px-3 py-1 rounded "
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
