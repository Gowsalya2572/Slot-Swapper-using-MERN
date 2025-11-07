import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useStore } from "../store/useStore";

export default function EventCard({ event }) {
  const { fetchEvents } = useStore();
  const navigate =useNavigate();

  const handleMakeSwappable = async () => {
    await api.put(`/events/${event._id}/status`, { status: "SWAPPABLE" });
    alert("Event marked as swappable!");
    fetchEvents();
    navigate("/marketplace");
  };

  return (
  <div>
    <div className="card bg-base-100 shadow-md p-4">
      <h3 className="font-semibold text-lg">{event.title}</h3>
      <p className="text-sm text-gray-500">
        {new Date(event.startTime).toLocaleString()} →{" "}
        {new Date(event.endTime).toLocaleString()}
      </p>
      <div className="mt-2">
        <span className={`badge ${event.status === "SWAPPABLE" ? "badge-success" : "badge-neutral"}`}>
          {event.status}
        </span>
      </div>
      {event.status === "BUSY" && (
        <button
          onClick={handleMakeSwappable}
          className="btn btn-sm btn-primary mt-3"
        >
          Make Swappable
        </button>
      )}
    </div>
    </div>

  );
}

