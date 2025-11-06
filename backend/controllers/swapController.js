import Event from '../models/Event.js'
import SwapRequest from '../models/SwapRequest.js';
import User from '../models/User.js';
import mongoose from 'mongoose';


export const slotSwappable = async (req, res) => {
  const slots = await Event.find({ status: 'SWAPPABLE', owner: { $ne: req.user._id } })
                           .populate('owner', 'name email');
  res.json(slots);
}

export const swapReq= async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  if (!mySlotId || !theirSlotId) return res.status(400).json({ message: 'Missing slot ids' });

  // fetch both slots and validate
  const [mySlot, theirSlot] = await Promise.all([
    Event.findById(mySlotId),
    Event.findById(theirSlotId)
  ]);
  if (!mySlot || !theirSlot) return res.status(404).json({ message: 'Slot not found' });
  if (!mySlot.owner.equals(req.user._id)) return res.status(403).json({ message: 'Not owner of mySlot' });

  // must be swappable and belong to different users
  if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') 
    return res.status(400).json({ message: 'One of slots is not SWAPPABLE' });
  if (theirSlot.owner.equals(req.user._id)) 
    return res.status(400).json({ message: 'Cannot request your own slot' });

  // Create SwapRequest and set both slot statuses to SWAP_PENDING atomically
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const swapRequest = await SwapRequest.create([{
      requester: req.user._id,
      requestedTo: theirSlot.owner,
      mySlot: mySlot._id,
      theirSlot: theirSlot._id,
      status: 'PENDING'
    }], { session });

    await Event.updateMany(
      { _id: { $in: [mySlot._id, theirSlot._id] } },
      { $set: { status: 'SWAP_PENDING' } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // populate the created swapRequest
    const sr = await SwapRequest.findById(swapRequest[0]._id)
      .populate('requester','name email')
      .populate('requestedTo','name email')
      .populate('mySlot')
      .populate('theirSlot');

    // Optionally: send realtime notification via Socket.IO
    const requestedToUser = await User.findById(theirSlot.owner);
    if (requestedToUser && requestedToUser.socketId && global.io) {
      global.io.to(requestedToUser.socketId).emit('swap-request', sr);
    }

    res.json(sr);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ message: 'Failed to create swap request', error: err.message });
  }
}

export const swapResponse =async (req,res)=>{
  const { requestId } = req.params;
  const { accept } = req.body;

  const swapReq = await SwapRequest.findById(requestId);
  if (!swapReq) return res.status(404).json({ message: 'Request not found' });
  // only the requestedTo user may respond
  if (!swapReq.requestedTo.equals(req.user._id)) return res.status(403).json({ message: 'Not authorised' });

  // Load events
  const [mySlot, theirSlot] = await Promise.all([
    Event.findById(swapReq.mySlot),
    Event.findById(swapReq.theirSlot)
  ]);
  if (!mySlot || !theirSlot) return res.status(404).json({ message: 'Slots not found' });

  // Start transaction
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    if (!accept) {
      swapReq.status = 'REJECTED';
      await swapReq.save({ session });
      await Event.updateMany(
        { _id: { $in: [mySlot._id, theirSlot._id] } },
        { $set: { status: 'SWAPPABLE' } },
        { session }
      );
      await session.commitTransaction();
      session.endSession();

      // Notify requester via socket
      const requesterUser = await User.findById(swapReq.requester);
      if (requesterUser && requesterUser.socketId && global.io) {
        global.io.to(requesterUser.socketId).emit('swap-response', { requestId: swapReq._id, accepted: false });
      }

      return res.json({ message: 'Rejected' });
    }

    // ACCEPT BRANCH — swap owners atomically
    // Refresh documents under session to ensure latest
    const mySlotSession = await Event.findById(mySlot._id).session(session);
    const theirSlotSession = await Event.findById(theirSlot._id).session(session);

    // Verify status still SWAP_PENDING
    if (mySlotSession.status !== 'SWAP_PENDING' || theirSlotSession.status !== 'SWAP_PENDING') {
      throw new Error('Slots are not in SWAP_PENDING state');
    }

    // Swap owners
    const ownerA = mySlotSession.owner;
    const ownerB = theirSlotSession.owner;

    mySlotSession.owner = ownerB;
    theirSlotSession.owner = ownerA;

    // set statuses to BUSY
    mySlotSession.status = 'BUSY';
    theirSlotSession.status = 'BUSY';

    await mySlotSession.save({ session });
    await theirSlotSession.save({ session });

    swapReq.status = 'ACCEPTED';
    await swapReq.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Notify both users via socket
    const requesterUser = await User.findById(swapReq.requester);
    const requestedUser = await User.findById(swapReq.requestedTo);
    if (requesterUser && requesterUser.socketId && global.io) {
      global.io.to(requesterUser.socketId).emit('swap-response', { requestId: swapReq._id, accepted: true, swap: swapReq });
    }
    if (requestedUser && requestedUser.socketId && global.io) {
      global.io.to(requestedUser.socketId).emit('swap-accepted', { requestId: swapReq._id, accepted: true, swap: swapReq });
    }

    return res.json({ message: 'Accepted', swapReq });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Swap response failed', err);
    return res.status(500).json({ message: 'Swap response failed', error: err.message });
  }
}

export const incoming =async (req, res) => {
  try {
    const incoming = await SwapRequest.find({ requestedTo: req.user._id }).sort({ createdAt: -1 })
      .populate('requester', 'name email')
      .populate('mySlot')
      .populate('theirSlot');
    res.json(incoming);
  } catch (err) {
    console.error('Incoming requests error', err);
    res.status(500).json({ message: 'Failed', error: err.message });
  }
}

export const outgoing = async (req, res) => {
  try {
    const outgoing = await SwapRequest.find({ requester: req.user._id }).sort({ createdAt: -1 })
      .populate('requestedTo', 'name email')
      .populate('mySlot')
      .populate('theirSlot');
    res.json(outgoing);
  } catch (err) {
    console.error('Outgoing requests error', err);
    res.status(500).json({ message: 'Failed', error: err.message });
  }}