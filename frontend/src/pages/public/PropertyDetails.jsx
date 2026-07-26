import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPropertyById, selectCurrentProperty, selectPropertyLoading } from '../../store/slices/propertySlice';
import { fetchRoomsByProperty, selectRooms, selectRoomLoading } from '../../store/slices/roomSlice';
import { submitJoinRequest, selectJoinRequestLoading } from '../../store/slices/joinRequestSlice';
import { selectUser } from '../../store/slices/authSlice';
import { MapPin, Building2, Wifi, Wind, Utensils, Users, Shield, Car, Check, UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

const AMENITY_ICONS = {
  WiFi: Wifi,
  AC: Wind,
  Food: Utensils,
  Parking: Car,
  'Security Guard': Shield,
};

export default function PropertyDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const property = useSelector(selectCurrentProperty);
  const rooms = useSelector(selectRooms);
  const user = useSelector(selectUser);
  const isPropertyLoading = useSelector(selectPropertyLoading);
  const isRoomLoading = useSelector(selectRoomLoading);
  const isRequestLoading = useSelector(selectJoinRequestLoading);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchPropertyById(id));
    dispatch(fetchRoomsByProperty(id));
  }, [dispatch, id]);

  const handleOpenModal = (room) => {
    // Basic auth check using Redux state (HttpOnly cookies mean we can't check localStorage)
    if (!user) {
      toast.error('Please login to request a room');
      navigate('/login');
      return;
    }
    
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
    setMessage('');
    setDocuments([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments((prev) => [...prev, ...files].slice(0, 5)); // max 5 files
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return;

    const formData = new FormData();
    formData.append('propertyId', id);
    formData.append('roomId', selectedRoom._id);
    formData.append('message', message);
    
    documents.forEach((file) => {
      formData.append('documents', file);
    });

    const resultAction = await dispatch(submitJoinRequest(formData));
    if (submitJoinRequest.fulfilled.match(resultAction)) {
      toast.success('Request sent successfully!');
      handleCloseModal();
    } else {
      toast.error(resultAction.payload || 'Failed to send request');
    }
  };

  if (isPropertyLoading || !property) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-16">
        {/* Property Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-border mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-64 md:h-96 bg-surface-100 rounded-2xl overflow-hidden relative">
              {property.photos && property.photos.length > 0 ? (
                <img src={property.photos[0].url} alt={property.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-surface-400">
                  <Building2 className="w-16 h-16" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="flex gap-2 mb-4">
                <span className="badge badge-primary">{property.type.toUpperCase()}</span>
                <span className="badge badge-neutral">{property.gender === 'male' ? '♂ Male' : property.gender === 'female' ? '♀ Female' : '⚥ Any Gender'}</span>
              </div>
              <h1 className="text-4xl font-bold text-surface-900 mb-2">{property.name}</h1>
              <div className="flex items-center text-surface-500 mb-6 gap-1.5 text-lg">
                <MapPin className="w-5 h-5 text-primary-500" />
                <span>{property.area ? `${property.area}, ` : ''}{property.city}, {property.pincode}</span>
              </div>
              
              <p className="text-surface-600 leading-relaxed mb-8">
                {property.description || 'No description provided.'}
              </p>
              
              <div className="mb-6">
                <h3 className="font-semibold text-surface-900 mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map(amenity => {
                    const Icon = AMENITY_ICONS[amenity] || Check;
                    return (
                      <span key={amenity} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 text-sm font-medium">
                        <Icon className="w-4 h-4" />
                        {amenity}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-surface-900 mb-6">Available Rooms</h2>
          {isRoomLoading ? (
            <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.length > 0 ? rooms.map(room => (
                <div key={room._id} className="bg-white rounded-2xl border border-border p-5 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-surface-900">Room {room.roomNumber}</h3>
                      <p className="text-surface-500 text-sm capitalize">{room.type} Sharing</p>
                    </div>
                    <span className={`badge ${room.status === 'available' ? 'badge-success' : 'badge-danger'}`}>
                      {room.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-6 flex-1 text-sm text-surface-600">
                    <p>Rent: <span className="font-semibold text-surface-900">₹{room.rent}/month</span></p>
                    <p>Deposit: <span className="font-semibold text-surface-900">₹{room.deposit}</span></p>
                    <p>Available Beds: <span className="font-semibold text-surface-900">{room.availableBeds} / {room.capacity}</span></p>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {room.isAC && <span className="text-xs bg-surface-100 px-2 py-1 rounded">AC</span>}
                      {room.hasAttachedBath && <span className="text-xs bg-surface-100 px-2 py-1 rounded">Attached Bath</span>}
                      {room.hasWiFi && <span className="text-xs bg-surface-100 px-2 py-1 rounded">WiFi</span>}
                    </div>
                  </div>
                  
                  {user?.role !== 'owner' && (
                    <button 
                      disabled={room.status !== 'available'}
                      onClick={() => handleOpenModal(room)} 
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Request to Join
                    </button>
                  )}
                </div>
              )) : (
                <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-border">
                  <p className="text-surface-500">No rooms listed for this property yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {isModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface-50 shrink-0">
              <h2 className="text-lg font-bold text-surface-900">Join Room {selectedRoom.roomNumber}</h2>
              <button onClick={handleCloseModal} className="text-surface-400 hover:text-surface-600 hover:bg-surface-200 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <form onSubmit={handleSubmitRequest} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-surface-900 mb-1">Message to Owner</label>
                  <textarea
                    placeholder="Hi, I am interested in joining..."
                    className="input w-full min-h-[100px] resize-y"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-900 mb-1">Upload Documents (Optional)</label>
                  <p className="text-xs text-surface-500 mb-2">Provide ID proof, Student ID, or other requested files (Max 5).</p>
                  
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                  />
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-surface-300 rounded-xl p-6 text-center cursor-pointer hover:bg-surface-50 transition-colors group"
                  >
                    <UploadCloud className="w-8 h-8 text-surface-400 mx-auto mb-2 group-hover:text-primary-500 transition-colors" />
                    <span className="text-sm font-medium text-surface-600 group-hover:text-primary-600 transition-colors">
                      Click to browse files
                    </span>
                  </div>

                  {documents.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {documents.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-surface-50 rounded-lg border border-border">
                          <span className="text-xs text-surface-700 truncate max-w-[80%]">{file.name}</span>
                          <button 
                            type="button" 
                            onClick={() => setDocuments(docs => docs.filter((_, idx) => idx !== i))}
                            className="text-danger-500 hover:bg-danger-50 p-1 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={isRequestLoading} className="btn-primary flex-1">
                    {isRequestLoading ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
