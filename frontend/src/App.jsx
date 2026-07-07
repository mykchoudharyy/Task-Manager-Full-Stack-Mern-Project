import { useState, useEffect } from 'react';
import Register from './Register';
import Login from './Login';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newDueDate, setNewDueDate] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [filter, setFilter] = useState('all');

  const fetchTasks = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('https://task-manager-p7q1.onrender.com/tasks', {
      headers: { 'Authorization': token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTasks(data.data);
        }
      })
      .catch(error => console.error("Error fetching tasks:", error));
  };

  useEffect(() => {
    if (currentView === 'tasks') {
      fetchTasks();
    }
  }, [currentView]);

  const addTask = async () => {
    if (newTask.trim() === "") {
      alert("Please enter a task name.");
      return;
    }

    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('title', newTask);
    formData.append('category', newCategory);
    if (newDueDate) formData.append('dueDate', newDueDate);
    if (newFile) formData.append('file', newFile);

    try {
      const response = await fetch('https://task-manager-p7q1.onrender.com/tasks', {
        method: 'POST',
        headers: {
          'Authorization': token
        },
        body: formData 
      });

      const data = await response.json();

      if (data.success) {
        setTasks([...tasks, data.data]);
        setNewTask("");
        setNewCategory("General");
        setNewDueDate("");
        setNewFile(null);
      } else {
        alert("Failed to add task: " + data.message);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Server error. Please check your backend.");
    }
  };

  const deleteTask = async (id) => {
    const token = localStorage.getItem('token');

    try {
      await fetch(`https://task-manager-p7q1.onrender.com/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      setTasks(tasks.filter(task => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`https://task-manager-p7q1.onrender.com/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ completed: !currentStatus })
      });

      const data = await response.json();

      if (data.success) {
        setTasks(tasks.map(task => 
          task._id === id ? { ...task, completed: !currentStatus } : task
        ));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const totalTasks = tasks.length;
  const completedCount = tasks.filter(task => task.completed).length;
  const pendingCount = totalTasks - completedCount;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="container">
      <h1>Task Manager</h1>

      {currentView === 'login' && (
        <>
          <Login onLoginSuccess={() => setCurrentView('tasks')} />
          <p style={{ textAlign: 'center', marginTop: '10px' }}>
            Need an account?{' '}
            <span style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setCurrentView('register')}>
              Register Here
            </span>
          </p>
        </>
      )}

      {currentView === 'register' && (
        <>
          <Register />
          <p style={{ textAlign: 'center', marginTop: '10px' }}>
            Already have an account?{' '}
            <span style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setCurrentView('login')}>
              Login Here
            </span>
          </p>
        </>
      )}

      {currentView === 'tasks' && (
        <>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              setCurrentView('login');
            }}
            style={{ float: 'right', backgroundColor: '#f44336', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}
          >
            Logout
          </button>

          <div style={{ clear: 'both', marginBottom: '20px' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.5em', color: '#1565c0' }}>{totalTasks}</h3>
                <p style={{ margin: 0, fontSize: '0.9em', color: '#555' }}>Total</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.5em', color: '#2e7d32' }}>{completedCount}</h3>
                <p style={{ margin: 0, fontSize: '0.9em', color: '#555' }}>Done</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.5em', color: '#c62828' }}>{pendingCount}</h3>
                <p style={{ margin: 0, fontSize: '0.9em', color: '#555' }}>Pending</p>
              </div>
            </div>
            
            <div style={{ flex: 2, minWidth: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold', color: '#333' }}>Progress</span>
                <span style={{ fontWeight: 'bold', color: '#1565c0' }}>{progressPercentage}%</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#bbdefb', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercentage}%`, backgroundColor: '#1565c0', height: '100%', transition: 'width 0.4s ease-in-out' }}></div>
              </div>
            </div>
          </div>

          <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter new task..."
              style={{ padding: '8px' }}
            />
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ padding: '8px', flex: 1, minWidth: '120px' }}
              >
                <option value="General">General</option>
                <option value="MCA Prep">MCA Prep</option>
                <option value="Police Exams">Police Exams</option>
                <option value="Coding">Coding</option>
                <option value="Personal">Personal</option>
              </select>

              <input 
                type="date" 
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                style={{ padding: '8px', flex: 1, minWidth: '120px' }}
              />

              <input 
                type="file" 
                onChange={(e) => setNewFile(e.target.files[0])}
                style={{ padding: '5px', flex: 1, minWidth: '150px' }}
              />
              
              <button onClick={addTask} style={{ padding: '8px 16px', minWidth: '80px' }}>Add Task</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setFilter('all')} style={{ fontWeight: filter === 'all' ? 'bold' : 'normal' }}>All</button>
            <button onClick={() => setFilter('pending')} style={{ fontWeight: filter === 'pending' ? 'bold' : 'normal' }}>Pending</button>
            <button onClick={() => setFilter('completed')} style={{ fontWeight: filter === 'completed' ? 'bold' : 'normal' }}>Completed</button>
          </div>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredTasks.map(task => (
              <li key={task._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #ccc', backgroundColor: '#f9f9f9', marginBottom: '5px', borderRadius: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    checked={task.completed || false} 
                    onChange={() => toggleComplete(task._id, task.completed)}
                    style={{ cursor: 'pointer', marginTop: '5px' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#888' : '#000', fontWeight: 'bold', fontSize: '1.1em' }}>
                      {task.title}
                    </span>
                    <div style={{ fontSize: '0.85em', color: '#555', marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ backgroundColor: '#e0e0e0', padding: '3px 8px', borderRadius: '4px' }}>
                         {task.category}
                      </span>
                      {task.dueDate && (
                        <span style={{ backgroundColor: '#e0e0e0', padding: '3px 8px', borderRadius: '4px' }}>
                           Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.fileUrl && (
                        <a href={task.fileUrl} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#cce5ff', color: '#004085', padding: '3px 8px', borderRadius: '4px', textDecoration: 'none' }}>
                          📎 View File
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <button className="delete-btn" onClick={() => deleteTask(task._id)} style={{ marginLeft: '10px' }}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;