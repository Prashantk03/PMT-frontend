import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import useSocket from "../hooks/useSocket";
import { toast } from "react-toastify";

// Task, Board and User types
type Task = {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  assignedTo?: string;
  dueDate?: Date;
  editing?: boolean;
  comments?: Comment[];
};

type Board = {
  _id: string;
  name: string;
  description: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  }
  members: {
    _id: string;
    name: string;
    email: string;
  }[];
};

type User = {
  _id: string;
  name?: string;
  email: string;
};

type Comment = {
  _id: string;
  text: string;
  author: string;
  authorId: string;
  createdAt: string;
};

type Status = "todo" | "in-progress" | "done";

// Function
export default function BoardDetail() {
  const { id } = useParams();
  const token = localStorage.getItem("access_token") || "";
  const [board, setBoard] = useState<Board | null>(null);
  const [title, setTitle] = useState("");
  const [tasksByStatus, setTasksByStatus] = useState<{
    [key: string]: Task[];
  }>({ todo: [], "in-progress": [], done: [] });
  const [status, setStatus] = useState("todo");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [members, setMembers] = useState<User[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch(`http://localhost:3000/boards/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const boardData = await res.json();
          setBoard(boardData);
          setMembers(boardData.members);
        } else {
          console.error("Failed to fetch board");
        }
      } catch (error) {
        console.error("Error fetching board", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [id, token]);


  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://localhost:3000/tasks?boardId=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data: Task[] = await res.json();
          const grouped: { [key: string]: Task[] } = {
            todo: [],
            "in-progress": [],
            done: [],
          };
          data.forEach((task) => {
            grouped[task.status || "todo"].push(task);
          });
          setTasksByStatus(grouped);
        } else {
          console.error("Failed to fetch tasks");
        }
      } catch (error) {
        console.error("Error fetching tasks", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTasks();
  }, [id, token]);

  // Create Task
  const handleAddTask = async () => {
    if (!title) return alert("Title is required");
    try {
      const res = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          boardId: id,
          status,
          assignedTo,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setStatus("todo");
        setAssignedTo("");
        setDueDate("");
      } else console.error("Failed to create task");
    } catch (error) {
      console.error("Error creating task", error);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTasksByStatus((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((status) => {
            updated[status] = updated[status].filter((t) => t._id !== taskId);
          });
          return updated;
        });
      } else console.error("Failed to delete task");
    } catch (error) {
      console.error("Error deleting task", error);
    }
  };

  // Update Task
  const handleUpdateTask = async (task: Task) => {
    try {
      const res = await fetch(`http://localhost:3000/tasks/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(task),
      });

      if (res.ok) {
        const updated = await res.json();
        const updatedTask = { ...updated, editing: false };
        const newStatus = (updatedTask.status || "todo") as Status;

        setTasksByStatus((prev) => {
          const newState: Record<Status, Task[]> = {
            todo: [],
            "in-progress": [],
            done: [],
          };

          (Object.keys(prev) as Status[]).forEach((status) => {
            newState[status] = prev[status].filter((t) => t._id !== task._id);
          });

          newState[newStatus].push(updatedTask);
          return newState;
        });
      } else {
        console.error("Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task", error);
    }
  };

  // ADD Comment
  const handleAddComment = async (taskId: string) => {
    const text = commentInputs[taskId];
    if (!text.trim()) return;

    const res = await fetch(`http://localhost:3000/tasks/${taskId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      const updatedTask = await res.json();
      setTasksByStatus((prev) => {
        const copy = { ...prev };
        const status = updatedTask.status;
        copy[status] = copy[status].map((t) =>
          t._id === taskId ? updatedTask : t
        );
        return copy;
      });
      setCommentInputs((prev) => ({ ...prev, [taskId]: "" }));
    }
  };

  // Delete Comment
  const handleDeleteComment = async (taskId: string, commentId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/tasks/${taskId}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setTasksByStatus((prev) => {
          const copy = { ...prev };
          for (const status in copy) {
            copy[status] = copy[status].map((task) => {
              if (task._id === taskId) {
                return {
                  ...task,
                  comments: task.comments?.filter((c) => c._id !== commentId), // 🧠 remove the comment from task
                };
              }
              return task;
            });
          }
          return copy;
        });
      } else {
        console.error("Failed to delete comment");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  // Invite Function
  const handleInvite = async () => {
    try {
      const res = await fetch(`http://localhost:3000/boards/${id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userEmail: inviteEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log("invite response", data);

        setMembers(data.board.members);
        console.log(data.board.members);

        setInviteEmail("");
      } else {
        console.error("Failed to invite user");
      }
    } catch (err) {
      console.error("Invite error:", err);
    }
  };

  // Web Socket
  useSocket(id, (event) => {
    if (event.type === "task") {
      const { task, action, taskId } = event; // ✅ Destructure properly

      setTasksByStatus((prev) => {
        const updated = { ...prev };

        // Delete Task
        if (action === "delete" && taskId) {
          for (const key in updated) {
            updated[key] = updated[key].filter((t) => t._id !== taskId);
          }
          return updated;
        }

        // Create or Update Task
        if (task) {
          const newStatus = task.status || "todo";

          // Remove from all statuses
          for (const key in updated) {
            updated[key] = updated[key].filter((t) => t._id !== task._id);
          }

          // Add to correct status column
          if (!updated[newStatus].some((t) => t._id === task._id)) {
            updated[newStatus] = [...updated[newStatus], task];
          }
        }

        return updated;
      });
    }

    // Comment Update
    if (event.type === "comment") {
      const { task } = event;

      const latestComment = task.comments?.[task.comments.length - 1];
      if (latestComment) {
        toast.info(` New comment by ${latestComment.author || "Unknown"}`);
      }

      setTasksByStatus((prev) => {
        const updated = { ...prev };

        for (const key in updated) {
          updated[key] = updated[key].map((t) =>
            t._id === task._id ? task : t
          );
        }

        return updated;
      });
    }

  });



  // Drag & Drop Function
  const onDragEnd = async (result: any) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceTasks = Array.from(tasksByStatus[source.droppableId]);
    const destTasks = Array.from(tasksByStatus[destination.droppableId]);
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask); // insert back in new position
      setTasksByStatus((prev) => ({
        ...prev,
        [source.droppableId]: sourceTasks,
      }));
    } else {
      movedTask.status = destination.droppableId;
      destTasks.splice(destination.index, 0, movedTask);
      setTasksByStatus((prev) => ({
        ...prev,
        [source.droppableId]: sourceTasks,
        [destination.droppableId]: destTasks,
      }));

      // Only send PATCH when status changes
      await fetch(`http://localhost:3000/tasks/${movedTask._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: movedTask.status }),
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!board) return <div>Board not found</div>;

  //**************************Display*******************************/
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">{board.name}</h1>
      <p className="text-gray-700 mb-4">{board.description}</p>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mt-6">Board Members</h3>
        <ul className="list-disc ml-5">
          {members.map((member) => (
            <li key={member._id}>
              {member.name || member.email || member._id}
            </li>
          ))}
        </ul>
        <input
          type="email"
          placeholder="Enter user email to invite"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          className="border px-2 py-1 rounded w-full mt-4"
        />
        <button
          onClick={handleInvite}
          className="bg-indigo-600 text-white px-3 py-1 mt-2 mb-2 rounded"
        >
          Invite
        </button>

        <h2 className="text-xl font-semibold mb-2">Add Task</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border px-4 py-2 rounded w-full mb-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border px-4 py-2 rounded w-full mb-2"
          rows={4} // you can increase or decrease row count as needed
          placeholder="Enter task description..."
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-4 py-2 rounded w-full mb-2"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="border px-4 py-2 rounded w-full mb-2"
        >
          <option value="">Assign to</option>
          {members.map((member) => (
            <option key={member.name} value={member.name}>
              {member.name || member._id || member.email}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border px-4 py-2 rounded w-full mb-2"
        />
        <button
          onClick={handleAddTask}
          className="bg-violet-600 text-white px-4 py-2 rounded w-full"
        >
          Create Task
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(tasksByStatus).map(([status]) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 p-4 rounded min-h-[200px]"
                >
                  <h3 className="text-lg font-semibold capitalize mb-2">
                    {status.replace("-", " ")}
                  </h3>
                  {tasksByStatus[status].map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="border p-3 mb-2 rounded bg-white shadow-sm"
                        >
                          {task.editing ? (
                            <>
                              <input
                                type="text"
                                value={task.title}
                                onChange={(e) =>
                                  setTasksByStatus((prev) => {
                                    const copy = { ...prev };
                                    copy[task.status! as string] = copy[
                                      task.status!
                                    ].map((t) =>
                                      t._id === task._id
                                        ? { ...t, title: e.target.value }
                                        : t
                                    );
                                    return copy;
                                  })
                                }
                                className="border px-2 py-1 mb-1 rounded w-full"
                              />
                              <textarea
                                value={task.description || ""}
                                onChange={(e) =>
                                  setTasksByStatus((prev) => {
                                    const copy = { ...prev };
                                    copy[task.status! as string] = copy[
                                      task.status!
                                    ].map((t) =>
                                      t._id === task._id
                                        ? { ...t, description: e.target.value }
                                        : t
                                    );
                                    return copy;
                                  })
                                }
                                className="border px-2 py-1 mb-1 rounded w-full"
                                rows={4}
                                placeholder="Enter task description..."
                              />

                              <select
                                value={task.assignedTo || ""}
                                onChange={(e) =>
                                  setTasksByStatus((prev) => {
                                    const copy = { ...prev };
                                    copy[task.status! as string] = copy[
                                      task.status!
                                    ].map((t) =>
                                      t._id === task._id
                                        ? { ...t, assignedTo: e.target.value }
                                        : t
                                    );
                                    return copy;
                                  })
                                }
                                className="border px-2 py-1 mb-1 rounded w-full"
                              >
                                <option value="">Assign to</option>
                                {members.map((member) => (
                                  <option key={member.name} value={member.name}>
                                    {member.name || member.email || member._id}
                                  </option>
                                ))}
                              </select>

                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleUpdateTask(task)}
                                  className="bg-green-600 text-white px-3 py-1 rounded"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() =>
                                    setTasksByStatus((prev) => {
                                      const copy = { ...prev };
                                      copy[task.status! as string] = copy[
                                        task.status!
                                      ].map((t) =>
                                        t._id === task._id
                                          ? { ...t, editing: false }
                                          : t
                                      );
                                      return copy;
                                    })
                                  }
                                  className="bg-gray-500 text-white px-3 py-1 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <h4 className="font-bold">{task.title}</h4>
                              {task.description && (
                                <p className="whitespace-pre-line">
                                  {task.description}
                                </p>
                              )}
                              {task.dueDate && (
                                <p className="text-sm text-gray-500">
                                  Due:{" "}
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </p>
                              )}
                              {task.assignedTo && (
                                <p className="text-sm text-gray-500">
                                  Assigned To: {task.assignedTo}
                                </p>
                              )}
                              <div className="mt-2">
                                <h5 className="font-semibold text-sm">
                                  Comments:
                                </h5>
                                {task.comments?.map((comment, idx) => {
                                  const isBoardOwner = board.createdBy?._id || board.createdBy;
                                  const isCommentAuthor = localStorage.getItem('userId');

                                  return (
                                    <div key={idx} className="text-sm text-gray-600 mb-1">
                                      <p>
                                        <strong>{comment.author}:</strong> {comment.text}
                                        <br />
                                        <span className="text-xs text-gray-400">
                                          {new Date(comment.createdAt).toLocaleString()}
                                        </span>
                                      </p>

                                      {(isBoardOwner || isCommentAuthor) && (
                                        <button
                                          onClick={() => handleDeleteComment(task._id, comment._id)}
                                          className="text-red-500 text-xs hover:underline"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}

                              </div>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() =>
                                    setTasksByStatus((prev) => {
                                      const copy = { ...prev };
                                      copy[task.status! as string] = copy[
                                        task.status!
                                      ].map((t) =>
                                        t._id === task._id
                                          ? { ...t, editing: true }
                                          : t
                                      );
                                      return copy;
                                    })
                                  }
                                  className="bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="bg-red-600 text-white px-3 py-1 rounded"
                                >
                                  Delete
                                </button>
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  value={commentInputs[task._id] || ""}
                                  onChange={(e) =>
                                    setCommentInputs((prev) => ({
                                      ...prev,
                                      [task._id]: e.target.value,
                                    }))
                                  }
                                  className="border px-2 py-1 mt-2 rounded w-full"
                                />
                                <button
                                  onClick={() => handleAddComment(task._id)}
                                  className="bg-purple-500 text-white mt-1 px-2 py-1 rounded text-sm"
                                >
                                  Comment
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
