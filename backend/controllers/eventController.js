import Event from '../models/Event.js'

export const createEvent= async (req, res) => {
try {
const { title , description, startTime, endTime } = req.body;
if (!title || !startTime || !endTime) return res.status(400).json({ message: 'Missing fields' });
const event = await Event.create({ title, description, startTime, endTime, owner: req.user._id });
 res.status(201).json({
      message: "Event created successfully",
      event,
    });
} catch (err) {
res.status(500).json({ message: 'Create event failed', error: err.message });
}
};

export const getEvent=async (req, res) => {
try {
const events = await Event.find({ owner: req.user._id }).sort({ startTime: 1 });
res.json(events);
} catch (err) {
res.status(500).json({ message: 'Failed to fetch events', error: err.message });
}
};

export const updateEvent =async (req, res) => {
try {
const event = await Event.findById(req.params.id);
if (!event) return res.status(404).json({ message: 'Event not found' });
if (!event.owner.equals(req.user._id)) return res.status(403).json({ message: 'Not authorized' });
const { title, startTime, endTime } = req.body;
if (title) event.title = title;
if (startTime) event.startTime = startTime;
if (endTime) event.endTime = endTime;
await event.save();
res.json(event);
} catch (err) {
res.status(500).json({ message: 'Update failed', error: err.message });
}
};


export const eventSwapStatus =async (req, res) => {
try {
const { status } = req.body; // expected BUSY | SWAPPABLE | SWAP_PENDING
const allowed = ['BUSY','SWAPPABLE','SWAP_PENDING'];
if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
const event = await Event.findById(req.params.id);
if (!event) return res.status(404).json({ message: 'Event not found' });
if (!event.owner.equals(req.user._id)) return res.status(403).json({ message: 'Not authorized' });
event.status = status;
await event.save();
res.json(event);
} catch (err) {
res.status(500).json({ message: 'Failed to set status', error: err.message });
}
} ;


export const deleteEvent = async (req, res) => {
try {
const event = await Event.findById(req.params.id);
if (!event) return res.status(404).json({ message: 'Event not found' });
if (!event.owner.equals(req.user._id)) return res.status(403).json({ message: 'Not authorized' });
await event.deleteOne();
res.json({ message: 'Deleted' });
} catch (err) {
res.status(500).json({ message: 'Delete failed', error: err.message });
}
};