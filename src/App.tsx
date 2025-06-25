import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import DashBoard from "./pages/dashboard";
import BoardDetail from "./pages/boardDetail";

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
    </Router>
  )
}

export default App;
