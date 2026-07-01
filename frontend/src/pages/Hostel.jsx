import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Home, Plus, Loader2, Trash2, Building, Users } from 'lucide-react';

function Hostel() {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [activeHostel, setActiveHostel] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submittingHostel, setSubmittingHostel] = useState(false);
  const [submittingRoom, setSubmittingRoom] = useState(false);
  
  const [hostelData, setHostelData] = useState({ name: '', type: 'Boys', program: '', totalRooms: '' });
  const [roomData, setRoomData] = useState({ roomNumber: '', capacity: '' });
  const [bulkRoomData, setBulkRoomData] = useState({ floor: 'Ground', startRoom: '', endRoom: '', capacity: '' });
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchPrograms();
    fetchHostels();
  }, []);

  const fetchPrograms = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/programs`, config);
      setPrograms(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchHostels = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/hostel`, config);
      setHostels(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (hostelId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/hostel/${hostelId}/rooms`, config);
      setRooms(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleHostelSubmit = async (e) => {
    e.preventDefault();
    setSubmittingHostel(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/hostel`, hostelData, config);
      fetchHostels();
      setHostelData({ name: '', type: 'Boys', program: '', totalRooms: '' });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmittingHostel(false);
    }
  };

  const handleDeleteHostel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hostel? All associated rooms will also be deleted.')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/hostel/${id}`, config);
      if (activeHostel === id) {
        setActiveHostel(null);
        setRooms([]);
      }
      fetchHostels();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    if (!activeHostel) return alert('Please select a hostel first');
    setSubmittingRoom(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/hostel/${activeHostel}/rooms`, roomData, config);
      fetchRooms(activeHostel);
      setRoomData({ roomNumber: '', capacity: '' });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmittingRoom(false);
    }
  };

  const handleBulkRoomSubmit = async (e) => {
    e.preventDefault();
    if (!activeHostel) return alert('Please select a hostel first');
    setSubmittingRoom(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/hostel/${activeHostel}/rooms/bulk`, bulkRoomData, config);
      fetchRooms(activeHostel);
      setBulkRoomData({ floor: 'Ground', startRoom: '', endRoom: '', capacity: '' });
      setIsBulkMode(false);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmittingRoom(false);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/hostel/room/${id}`, config);
      fetchRooms(activeHostel);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <Home className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Hostel Management</h1>
            <p className="text-sm text-slate-500">Manage hostels, rooms, and allocations.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HOSTELS SECTION */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Building className="w-5 h-5 text-primary" /> Create Hostel</h2>
            <form onSubmit={handleHostelSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Hostel Name</label>
                  <input type="text" required value={hostelData.name} onChange={e => setHostelData({...hostelData, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. Boys Hostel A" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Program</label>
                  <select required value={hostelData.program} onChange={e => setHostelData({...hostelData, program: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all">
                    <option value="">Select Program</option>
                    {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                  <select required value={hostelData.type} onChange={e => setHostelData({...hostelData, type: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all">
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Total Rooms</label>
                  <input type="number" required value={hostelData.totalRooms} onChange={e => setHostelData({...hostelData, totalRooms: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <button type="submit" disabled={submittingHostel} className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-all flex justify-center items-center">
                {submittingHostel ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Hostel'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200"><h3 className="font-semibold text-slate-700">Hostels Directory</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Program</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="4" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                  ) : hostels.length > 0 ? (
                    hostels.map((h) => (
                      <tr key={h._id} onClick={() => { setActiveHostel(h._id); fetchRooms(h._id); }} className={`cursor-pointer transition-colors ${activeHostel === h._id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                        <td className="p-4 text-slate-700 font-medium">{h.name}</td>
                        <td className="p-4 text-slate-600 text-sm">{h.program?.name || 'N/A'}</td>
                        <td className="p-4 text-slate-600 text-sm">{h.type}</td>
                        <td className="p-4">
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteHostel(h._id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-500">No hostels found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ROOMS SECTION */}
        <div className="space-y-6">
          {activeHostel ? (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Add Room(s)</h2>
                  <button onClick={() => setIsBulkMode(!isBulkMode)} className="text-sm text-indigo-600 font-medium hover:underline">
                    {isBulkMode ? 'Single Room Mode' : 'Bulk Generation Mode'}
                  </button>
                </div>
                {isBulkMode ? (
                  <form onSubmit={handleBulkRoomSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Floor</label>
                        <input type="text" required value={bulkRoomData.floor} onChange={e => setBulkRoomData({...bulkRoomData, floor: e.target.value})} placeholder="e.g. 1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Capacity</label>
                        <input type="number" required value={bulkRoomData.capacity} onChange={e => setBulkRoomData({...bulkRoomData, capacity: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Start Room No.</label>
                        <input type="number" required value={bulkRoomData.startRoom} onChange={e => setBulkRoomData({...bulkRoomData, startRoom: e.target.value})} placeholder="e.g. 101" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">End Room No.</label>
                        <input type="number" required value={bulkRoomData.endRoom} onChange={e => setBulkRoomData({...bulkRoomData, endRoom: e.target.value})} placeholder="e.g. 125" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                      </div>
                    </div>
                    <button type="submit" disabled={submittingRoom} className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all flex justify-center items-center">
                      {submittingRoom ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Bulk Generate Rooms'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRoomSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Room Number</label>
                        <input type="text" required value={roomData.roomNumber} onChange={e => setRoomData({...roomData, roomNumber: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Capacity</label>
                        <input type="number" required value={roomData.capacity} onChange={e => setRoomData({...roomData, capacity: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                      </div>
                    </div>
                    <button type="submit" disabled={submittingRoom} className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all flex justify-center items-center">
                      {submittingRoom ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Room'}
                    </button>
                  </form>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200"><h3 className="font-semibold text-slate-700">Rooms in Selected Hostel</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-semibold">Room No</th>
                        <th className="p-4 font-semibold">Floor</th>
                        <th className="p-4 font-semibold text-center">Capacity</th>
                        <th className="p-4 font-semibold text-center">Occupied</th>
                        <th className="p-4 font-semibold text-center">Available Beds</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rooms.length > 0 ? (
                        rooms.map((r) => {
                          const availableBeds = r.capacity - r.occupied;
                          const status = availableBeds <= 0 ? 'Full' : 'Available';
                          return (
                            <tr key={r._id} className="hover:bg-slate-50/50">
                              <td className="p-4 text-slate-700 font-medium">{r.roomNumber}</td>
                              <td className="p-4 text-slate-600">{r.floor || 'Ground'}</td>
                              <td className="p-4 text-slate-600 text-center">{r.capacity}</td>
                              <td className="p-4 text-slate-600 text-center">{r.occupied}</td>
                              <td className="p-4 text-slate-600 text-center font-medium">{availableBeds}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {status}
                                </span>
                              </td>
                              <td className="p-4">
                                <button onClick={() => handleDeleteRoom(r._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr><td colSpan="7" className="p-8 text-center text-slate-500">No rooms found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-slate-500 h-full min-h-[300px]">
              <Users className="w-12 h-12 mb-3 text-slate-300" />
              <p>Select a hostel from the list to manage its rooms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Hostel;
