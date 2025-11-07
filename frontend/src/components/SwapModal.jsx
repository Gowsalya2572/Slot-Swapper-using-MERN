import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import api from "../api/axios";

export default function SwapModal({ theirSlot, onClose }) {
  const { events, fetchEvents } = useStore();
  const [mySlot, setMySlot] = useState(null);
  const [loading, setLoading] = useState(false);

  const swappableEvents = events.filter((e) => e.status === "SWAPPABLE");

  const handleSwap = async () => {
    if (!mySlot) return;
    setLoading(true);
    try {
      await api.post("/swap-request", {
        mySlotId: mySlot._id,
        theirSlotId: theirSlot._id,
      });
      alert("Swap request sent!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <dialog id="swap_modal" className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-2">Request Swap</h3>
        <p className="mb-4 text-sm">
          Choose one of your SWAPPABLE slots to offer in exchange for:
          <br />
          <span className="font-semibold">{theirSlot.title}</span> (
          {new Date(theirSlot.startTime).toLocaleString()})
        </p>

        <select
          className="select select-bordered w-full"
          onChange={(e) => setMySlot(JSON.parse(e.target.value))}
        >
          <option value="">Select your slot</option>
          {swappableEvents.map((e) => (
            <option key={e._id} value={JSON.stringify(e)}>
              {e.title} — {new Date(e.startTime).toLocaleString()}
            </option>
          ))}
        </select>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!mySlot || loading}
            onClick={handleSwap}
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
