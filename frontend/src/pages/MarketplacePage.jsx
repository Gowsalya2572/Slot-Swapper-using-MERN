import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import SwapModal from "../components/SwapModal";

export default function MarketplacePage() {
  const { swappableSlots, fetchSwappableSlots } = useStore();
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchSwappableSlots().then(()=>{
        console.log("Swappable slots fetched:", swappableSlots);
    });
  }, [fetchSwappableSlots]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Marketplace</h2>
      {swappableSlots.length === 0 ? (
        <p className="text-gray-500">No swappable slots available.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {swappableSlots.map((slot) => (
            <div key={slot._id} className="card bg-base-100 shadow-md p-4">
              <h3 className="font-semibold text-lg">{slot.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(slot.startTime).toLocaleString()} →{" "}
                {new Date(slot.endTime).toLocaleString()}
              </p>
              <div className="mt-3">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setSelectedSlot(slot)}
                >
                  Request Swap
                </button>
              </div>
            </div>
          ))};
        </div>
      )}

      {selectedSlot && (
        <SwapModal theirSlot={selectedSlot} onClose={() => setSelectedSlot(null)} />
      )}
    </div>
  );
}
