import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Profile from "./components/Profile";
import AdminLogin from "./components/AdminLogin";
import AdminDasboard from "./components/AdminDasboard";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile/>}/>
      <Route path="/admin" element={<AdminLogin/>}/>
      <Route path="/admin/dashboard" element={<AdminDasboard/>}/>
    </>
  )
);

function App() {
    return (

          <RouterProvider router={router} />

    );
  }
  
  export default App;
