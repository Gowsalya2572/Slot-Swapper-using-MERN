import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import api from "../api/axios";
import EventCard from "../components/EventCard";

export default function CalendarPage() {
  const { events, fetchEvents } = useStore();
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/events", { title, startTime, endTime });
      setTitle("");
      setStartTime("");
      setEndTime("");
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Calendar</h2>

      <form
        onSubmit={handleAddEvent}
        className="bg-base-100 p-4 rounded-lg shadow-md mb-6 space-y-3"
      >
        <h3 className="font-semibold text-lg">Add New Event</h3>
        <input
          type="text"
          placeholder="Event Title"
          className="input input-bordered w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="flex gap-3">
          <input
            type="datetime-local"
            className="input input-bordered w-full"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <input
            type="datetime-local"
            className="input input-bordered w-full"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Adding..." : "Add Event"}
        </button>
      </form>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}
