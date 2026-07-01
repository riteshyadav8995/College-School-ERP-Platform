import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Building2, Key, Users, Copy, CheckCircle2, Loader2, BedDouble } from 'lucide-react';

function StudentHostel() {
  const { user } = useSelector((state) => state.auth);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  
  const [shareKeyInput, setShareKeyInput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/students/profile`, config);
      setProfile(res.data);
      
      if (!res.data.room && res.data.program) {
        const progId = res.data.program._id || res.data.program;
        fetchHostels(progId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHostels = async (programId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/hostel/program/${programId}`, config);
      setHostels(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRooms = async (hostelId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/hostel/${hostelId}/rooms/available`, config);
      setRooms(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleHostelChange = (e) => {
    const val = e.target.value;
    setSelectedHostel(val);
    setSelectedFloor('');
    setSelectedRoom('');
    if (val) {
      fetchRooms(val);
    } else {
      setRooms([]);
    }
  };

  const handleSelfAssign = async (e) => {
    if (e) e.preventDefault();
    if (!selectedRoom) return alert('Please select a room');
    
    // Check if room is yellow and locked
    const roomObj = rooms.find(r => r._id === selectedRoom);
    if (roomObj && roomObj.occupied > 0 && roomObj.occupied < roomObj.capacity) {
      if (roomObj.keyGeneratedAt) {
        const timeDiff = Date.now() - new Date(roomObj.keyGeneratedAt).getTime();
        if (timeDiff < 5 * 60 * 1000) {
          return alert('This room is currently reserved by a student. If you are their friend, please use the "Join a Friend" section with their Share Key.');
        }
      }
    }
    
    setActionLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/students/profile/room-assign`, { roomId: selectedRoom }, config);
      fetchProfile();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinByKey = async (e) => {
    e.preventDefault();
    if (!shareKeyInput) return alert('Please enter a room key');
    setActionLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/students/profile/room-join`, { shareKey: shareKeyInput.toUpperCase() }, config);
      fetchProfile();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profile.room?.shareKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasRoom = profile?.room != null;
  const hasProgram = profile?.program != null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="bg-indigo-100 p-3 rounded-xl">
          <Building2 className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Hostel Accommodation</h1>
          <p className="text-sm text-slate-500">Manage your room allocation and share access with friends.</p>
        </div>
      </div>

      {!hasProgram ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-2">Program Missing</h2>
          <p>You are not currently enrolled in any academic program in the system. Hostels are assigned based on your program.</p>
          <p className="mt-2 text-sm font-medium">Please contact your administrator to update your profile.</p>
        </div>
      ) : hasRoom ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BedDouble className="w-6 h-6 text-primary" /> Current Room Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Hostel Name</p>
                <p className="text-lg font-medium text-slate-800">{profile.hostel?.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Room Number</p>
                  <p className="text-lg font-medium text-slate-800">{profile.room?.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Capacity</p>
                  <p className="text-lg font-medium text-slate-800">{profile.room?.occupied} / {profile.room?.capacity}</p>
                </div>
              </div>
            </div>
          </div>
          
          {profile.room?.occupied >= profile.room?.capacity ? (
            <div className="bg-emerald-500 rounded-2xl shadow-sm p-6 text-white flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-white/20 p-3 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Room is Full</h2>
                <p className="text-emerald-100 text-sm mt-1">All beds in this room have been occupied.</p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm p-6 text-white space-y-6 flex flex-col justify-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Key className="w-6 h-6" /> Room Share Key
              </h2>
              <p className="text-indigo-100 text-sm">
                Share this key with your friends from the same program so they can book the remaining beds in your room!
              </p>
              {profile.room?.shareKey ? (
                <div className="bg-white/10 p-4 rounded-xl border border-white/20 flex justify-between items-center backdrop-blur-sm">
                  <span className="font-mono text-2xl tracking-widest font-bold">{profile.room.shareKey}</span>
                  <button onClick={copyToClipboard} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    {copied ? <CheckCircle2 className="w-5 h-5 text-green-300" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              ) : (
                <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm text-center">
                  <p className="text-indigo-100 font-medium">No share key generated.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Book a New Room
            </h2>
            <form onSubmit={handleSelfAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Hostel</label>
                <select required value={selectedHostel} onChange={handleHostelChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all">
                  <option value="">Select a hostel</option>
                  {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                </select>
              </div>

              {selectedHostel && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Select Floor</label>
                  <select required value={selectedFloor} onChange={e => { setSelectedFloor(e.target.value); setSelectedRoom(''); }} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all">
                    <option value="">Select Floor</option>
                    {[...new Set(rooms.map(r => r.floor || 'Ground'))].sort().map(floor => (
                      <option key={floor} value={floor}>Floor {floor}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedFloor && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Available Rooms</label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {rooms.filter(r => (r.floor || 'Ground') === selectedFloor).sort((a,b) => parseInt(a.roomNumber) - parseInt(b.roomNumber)).map(r => {
                      const isFull = r.occupied >= r.capacity;
                      const isEmpty = r.occupied === 0;
                      const isPartial = !isEmpty && !isFull;
                      let bgClass = "bg-green-100 border-green-300 text-green-700 hover:bg-green-200 cursor-pointer"; // Empty
                      if (isFull) bgClass = "bg-red-100 border-red-300 text-red-700 opacity-60 cursor-not-allowed";
                      else if (isPartial) bgClass = "bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200 cursor-pointer";
                      
                      const isSelected = selectedRoom === r._id;
                      if (isSelected) bgClass = "bg-primary text-white border-primary shadow-md transform scale-105";

                      return (
                        <div 
                          key={r._id}
                          onClick={() => !isFull && setSelectedRoom(r._id)}
                          className={`border rounded-lg p-2 text-center transition-all ${bgClass}`}
                          title={`Capacity: ${r.occupied}/${r.capacity}`}
                        >
                          <div className="font-bold text-sm">{r.roomNumber}</div>
                          <div className="text-[10px] mt-1">{r.occupied}/{r.capacity} Beds</div>
                        </div>
                      )
                    })}
                  </div>
                  {rooms.filter(r => (r.floor || 'Ground') === selectedFloor).length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">No rooms on this floor.</p>
                  )}
                </div>
              )}

              <button type="submit" disabled={actionLoading || !selectedRoom} className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed">
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 border-t-4 border-t-indigo-500 flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" /> Join a Friend
            </h2>
            <p className="text-slate-600 text-sm mb-6 flex-1">
              If your friend has already booked a room and shared their 6-character room key with you, enter it below to join their room.
            </p>
            <form onSubmit={handleJoinByKey} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Room Key</label>
                <input type="text" required placeholder="e.g. A1B2C3" value={shareKeyInput} onChange={e => setShareKeyInput(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono uppercase tracking-widest text-center text-lg" maxLength={6} />
              </div>
              <button type="submit" disabled={actionLoading || !shareKeyInput} className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed">
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Room'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentHostel;
