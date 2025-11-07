import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";

export default function Navbar() {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-200 px-6 shadow-md">
      <div className="flex-1">
        <Link to="/" className="text-xl font-bold text-primary">
          SlotSwapper
        </Link>
      </div>

      <div className="flex-none">
        <ul className="menu menu-horizontal px-1 gap-3">
          <li><Link to="/">My Calendar</Link></li>
          <li><Link to="/marketplace">Marketplace</Link></li>
          <li><Link to="/requests">Requests</Link></li>
        </ul>
        <div className="dropdown dropdown-end ml-4">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-primary text-white flex items-center justify-center">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box shadow-md mt-3 w-52"
          >
            <li><button onClick={handleLogout}>Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
