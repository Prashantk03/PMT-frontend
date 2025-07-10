import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login from "./pages/login";
import Register from "./pages/register";
import DashBoard from "./pages/dashboard";
import BoardDetail from "./pages/boardDetail";
import 'react-toastify/dist/ReactToastify.css';

function App(){
  return(
    <Router>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/dashboard" element={<DashBoard/>}/>
        <Route path="/board/:id" element={<BoardDetail/>}/>
        <Route path="*" element={<h2 className="p-4 text-red-500">404 Not Found</h2>} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Router>
  )
}

export default App;
