import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Task and Board types
type Task = {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  assignedTo?: string;
  dueDate?: Date;
  editing?: boolean;
};

type Board = {
  _id: string;
  name: string;
  description: string;
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

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch(`http://localhost:3000/boards/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) setBoard(await res.json());
        else console.error("Failed to fetch board");
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
        const newTask = await res.json();
        setTasksByStatus((prev) => ({
          ...prev,
          [newTask.status || "todo"]: [
            ...prev[newTask.status || "todo"],
            newTask,
          ],
        }));
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

// Drag & Drop Function
  const onDragEnd = async (result: any) => {
    const { source, destination } = result;
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    )
      return;
    const sourceTasks = Array.from(tasksByStatus[source.droppableId]);
    const [movedTask] = sourceTasks.splice(source.index, 1);
    const destTasks = Array.from(tasksByStatus[destination.droppableId]);
    movedTask.status = destination.droppableId;
    destTasks.splice(destination.index, 0, movedTask);
    setTasksByStatus((prev) => ({
      ...prev,
      [source.droppableId]: sourceTasks,
      [destination.droppableId]: destTasks,
    }));
    await fetch(`http://localhost:3000/tasks/${movedTask._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: movedTask.status }),
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!board) return <div>Board not found</div>;

//**************************Display*******************************/
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">{board.name}</h1>
      <p className="text-gray-700 mb-4">{board.description}</p>

      <div className="mb-6">
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
        <input
          type="text"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Assign to (user id)"
          className="border px-4 py-2 rounded w-full mb-2"
        />
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
                              <input
                                type="text"
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
                              />
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
