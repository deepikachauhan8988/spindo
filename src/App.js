import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";
import "bootstrap-icons/font/bootstrap-icons.css";
// import "../src/componets/custom/style.css";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";


import Home from "./componets/pages/Home";
import AdminDashBoard from "./componets/admin_dashboard/AdminDashBoard";

// import Footer from "./componets/footer/Footer";
import NavBar from "./componets/navbar/NavBar";
import Login from "./componets/login/Login";
import Registration from "./register/Registration";
import UserDashBoard from "./componets/user_dashboard/UserDashBoard";
import VendorDashBoard from "./componets/vendor_dashboard/VendorDashBoard";
import StaffDashBoard from "./componets/staff_dashboard/StaffDashBoard";



function App() {

  const location = useLocation();

  const hiddenPaths = new Set([
    "/AdminDashBoard",
    "/UserDashBoard",
    "/StaffDashBoard",
    "/VendorDashBoard",
   
  ]);

  const shouldHideNavbar = hiddenPaths.has(location.pathname);
  
  return (
    
      <div className="app-container">
        {!shouldHideNavbar && <NavBar />}
        
        <main className="main-content">
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Home />} />
            <Route path="/AdminDashBoard" element={<AdminDashBoard />} />
            <Route path="/Registration" element={<Registration />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/UserDashBoard" element={<UserDashBoard />} />
            <Route path="/VendorDashBoard" element={<VendorDashBoard />} />
            <Route path="/StaffDashBoard" element={<StaffDashBoard />} />
            
      
           
            
          </Routes>
        </main>
           {/* {!shouldHideNavbar && <Footer />} */}
      
      </div>
 
  );
}

export default App;
