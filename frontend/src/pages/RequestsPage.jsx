// import { useEffect } from "react";
// import { useStore } from "../store/useStore";
// import api from "../api/axios";
// import socket from "../utils/socket";

// export default function RequestsPage() {
//   const { incomingRequests, outgoingRequests, user, setState } = useStore();

//   const fetchRequests = async () => {
//     try {
//       const [incomingRes, outgoingRes] = await Promise.all([
//         api.get("/requests/incoming"),
//         api.get("/requests/outgoing"),
//       ]);
//       setState({
//         incomingRequests: incomingRes.data,
//         outgoingRequests: outgoingRes.data,
//       });
//     } catch (err) {
//       console.error("Failed to fetch requests:", err);
//     }
//   };

//   const handleResponse = async (requestId, accepted) => {
//     try {
//       await api.post(`/swap-response/${requestId}`, { accepted });
//       fetchRequests();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       fetchRequests();
//       socket.emit("register", user._id);
//       socket.on("swap-notification", fetchRequests);
//     }
//     return () => socket.off("swap-notification");
//   }, [user]);

//   if (!user) return <div className="p-6 text-gray-500">Please login to view swap requests.</div>;

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4">Swap Requests</h2>

//       {/* Incoming */}
//       <section className="mb-6">
//         <h3 className="text-lg font-semibold mb-2">Incoming Requests</h3>
//         {incomingRequests.length === 0 ? (
//           <p className="text-gray-500">No incoming requests.</p>
//         ) : (
//           incomingRequests.map((req) => (
//             <div key={req._id} className="card bg-base-100 shadow-md p-4 flex justify-between">
//               <p>
//                 <span className="font-semibold">{req.fromUser?.name}</span> wants to swap their{" "}
//                 <span className="font-semibold">{req.theirSlot.title}</span> with your{" "}
//                 <span className="font-semibold">{req.mySlot.title}</span>.
//               </p>
//               <div className="flex gap-2">
//                 <button className="btn btn-success btn-sm" onClick={() => handleResponse(req._id, true)}>
//                   Accept
//                 </button>
//                 <button className="btn btn-error btn-sm" onClick={() => handleResponse(req._id, false)}>
//                   Reject
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </section>

//       {/* Outgoing */}
//       <section>
//         <h3 className="text-lg font-semibold mb-2">Outgoing Requests</h3>
//         {outgoingRequests.length === 0 ? (
//           <p className="text-gray-500">No outgoing requests.</p>
//         ) : (
//           outgoingRequests.map((req) => (
//             <div key={req._id} className="card bg-base-100 shadow-md p-4 flex justify-between">
//               <p>
//                 You offered to swap your{" "}
//                 <span className="font-semibold">{req.mySlot.title}</span> for{" "}
//                 <span className="font-semibold">{req.theirSlot.title}</span> from{" "}
//                 {req.toUser?.name}.
//               </p>
//               <span
//                 className={`badge ${
//                   req.status === "PENDING"
//                     ? "badge-warning"
//                     : req.status === "ACCEPTED"
//                     ? "badge-success"
//                     : "badge-error"
//                 }`}
//               >
//                 {req.status}
//               </span>
//             </div>
//           ))
//         )}
//       </section>
//     </div>
//   );
// }


import { useEffect } from "react";
import { useStore } from "../store/useStore";
import api from "../api/axios";
import socket from "../utils/socket";
import toast from "react-hot-toast";

export default function RequestsPage() {
  const { incomingRequests, outgoingRequests, user, setState } = useStore();

  const fetchRequests = async () => {
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        api.get("/requests/incoming"),
        api.get("/requests/outgoing"),
      ]);
      setState({
        incomingRequests: incomingRes.data,
        outgoingRequests: outgoingRes.data,
      });
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    }
  };

  const handleResponse = async (requestId, accepted) => {
    try {
      await api.post(`/swap-response/${requestId}`, { accepted });
      fetchRequests();

      // ✅ Toast message feedback
      if (accepted) {
        toast.success("Swap request accepted! ✅");
      } else {
        toast.error("Swap request rejected ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while processing the request ⚠️");
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
      socket.emit("register", user._id);
      socket.on("swap-notification", fetchRequests);
    }
    return () => socket.off("swap-notification");
  }, [user]);

  if (!user) return <div className="p-6 text-gray-500">Please login to view swap requests.</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Swap Requests</h2>

      {/* Incoming */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Incoming Requests</h3>
        {incomingRequests.length === 0 ? (
          <p className="text-gray-500">No incoming requests.</p>
        ) : (
          incomingRequests.map((req) => (
            <div key={req._id} className="card bg-base-100 shadow-md p-4 flex justify-between">
              <p>
                <span className="font-semibold">{req.fromUser?.name}</span> wants to swap their{" "}
                <span className="font-semibold">{req.theirSlot.title}</span> with your{" "}
                <span className="font-semibold">{req.mySlot.title}</span>.
              </p>
              <div className="flex gap-2">
                <button className="btn btn-success btn-sm" onClick={() => handleResponse(req._id, true)}>
                  Accept
                </button>
                <button className="btn btn-error btn-sm" onClick={() => handleResponse(req._id, false)}>
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Outgoing */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Outgoing Requests</h3>
        {outgoingRequests.length === 0 ? (
          <p className="text-gray-500">No outgoing requests.</p>
        ) : (
          outgoingRequests.map((req) => (
            <div key={req._id} className="card bg-base-100 shadow-md p-4 flex justify-between">
              <p>
                You offered to swap your{" "}
                <span className="font-semibold">{req.mySlot.title}</span> for{" "}
                <span className="font-semibold">{req.theirSlot.title}</span> from{" "}
                {req.toUser?.name}.
              </p>
              <span
                className={`badge ${
                  req.status === "PENDING"
                    ? "badge-warning"
                    : req.status === "ACCEPTED"
                    ? "badge-success"
                    : "badge-error"
                }`}
              >
                {req.status}
              </span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
