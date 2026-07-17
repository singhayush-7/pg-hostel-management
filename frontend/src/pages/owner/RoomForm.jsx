import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Save,
  Loader2,
  Wifi,
  Wind,
  Bath,
  Utensils
} from 'lucide-react';
import toast from 'react-hot-toast';

import ImageUpload from '../../components/ui/ImageUpload';
import {
  createRoom,
  updateRoom,
  fetchRoomById,
  selectCurrentRoom,
  selectRoomLoading,
  clearCurrentRoom,
} from '../../store/slices/roomSlice';

const ROOM_TYPES = ['Single', 'Double', 'Triple'];
const STATUS_OPTIONS = ['Available', 'Occupied', 'Maintenance'];

const DEFAULT_FORM = {
  roomNumber: '',
  floor: 1,
  type: 'Single',
  capacity: 1,
  rent: '',
  deposit: '',
  status: 'Available',
  isAC: false,
  hasWiFi: false,
  hasAttachedBath: false,
  hasFood: false,
};

 
function Section({ title, subtitle, children }) {
  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-surface-900">{title}</h2>
        {subtitle && <p className="text-sm text-surface-500 mt-1">{subtitle}</p>}
      </div>
      <div className="border-t border-border" />
      {children}
    </div>
  );
}

 
function ButtonGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
            value === opt
              ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-sm'
              : 'border-border bg-white text-surface-600 hover:border-primary-300 hover:bg-surface-50 hover:text-surface-900'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

 
function Field({ label, required, error, children }) {
  return (
    <div className="space-y-2">
      <label className="input-label">
        {label} {required && <span className="text-danger-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-danger-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export default function RoomForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { propertyId, roomId } = useParams();
  const isEditMode = Boolean(roomId);

  const currentRoom = useSelector(selectCurrentRoom);
  const isLoading = useSelector(selectRoomLoading);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchRoomById(roomId));
    }
    return () => {
      dispatch(clearCurrentRoom());
    };
  }, [dispatch, roomId, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentRoom) {
      setForm({
        roomNumber: currentRoom.roomNumber || '',
        floor: currentRoom.floor || 1,
        type: currentRoom.type || 'Single',
        capacity: currentRoom.capacity || 1,
        rent: currentRoom.rent || '',
        deposit: currentRoom.deposit || '',
        status: currentRoom.status || 'available',
        isAC: currentRoom.isAC || false,
        hasWiFi: currentRoom.hasWiFi || false,
        hasAttachedBath: currentRoom.hasAttachedBath || false,
        hasFood: currentRoom.hasFood || false,
      });

      if (currentRoom.images?.length) {
        setImages(
          currentRoom.images.map((p) => ({
            preview: p.url,
            file: null,
            url: p.url,
          }))
        );
      }
    }
  }, [isEditMode, currentRoom]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
       
      if (field === 'type') {
        if (value === 'Single') updated.capacity = 1;
        if (value === 'Double') updated.capacity = 2;
        if (value === 'Triple') updated.capacity = 3;
      }
      
      return updated;
    });
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validate = () => {
    const errs = {};
    if (!String(form.roomNumber).trim()) errs.roomNumber = 'Room number is required';
    if (!form.rent) errs.rent = 'Rent amount is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    images.forEach((img) => {
      if (img.file) {
        formData.append('images', img.file);
      } else if (img.url) {
        formData.append('existingImages', img.url);
      }
    });

    try {
      let result;
      if (isEditMode) {
        result = await dispatch(updateRoom({ id: roomId, formData }));
        if (updateRoom.fulfilled.match(result)) {
          toast.success('Room updated successfully!');
          navigate(`/owner/properties/${propertyId}/rooms`);
        } else {
          toast.error(result.payload || 'Failed to update room');
        }
      } else {
        result = await dispatch(createRoom({ propertyId, formData }));
        if (createRoom.fulfilled.match(result)) {
          toast.success('Room created successfully!');
          navigate(`/owner/properties/${propertyId}/rooms`);
        } else {
          toast.error(result.payload || 'Failed to create room');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate(`/owner/properties/${propertyId}/rooms`);

  return (
    <div className="relative pb-28 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleCancel}
          className="w-10 h-10 rounded-xl border border-border bg-white hover:bg-surface-50 flex items-center justify-center text-surface-500 hover:text-surface-900 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            {isEditMode ? 'Edit Room' : 'Add New Room'}
          </h1>
          <p className="text-surface-500 text-sm mt-1">
            {isEditMode ? 'Update your room details' : 'Configure a new room for your property'}
          </p>
        </div>
      </div>

      {isLoading && isEditMode && !currentRoom ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
          
          <Section title="Room Details" subtitle="Basic information about the room">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Room Number" required error={errors.roomNumber}>
                <input
                  type="text"
                  className={`input ${errors.roomNumber ? 'input-error' : ''}`}
                  placeholder="e.g. 101, A2, etc."
                  value={form.roomNumber}
                  onChange={(e) => handleChange('roomNumber', e.target.value)}
                />
              </Field>
              <Field label="Floor">
                <input
                  type="number"
                  className="input"
                  min="0"
                  placeholder="e.g. 1"
                  value={form.floor}
                  onChange={(e) => handleChange('floor', parseInt(e.target.value) || 0)}
                />
              </Field>
            </div>
            
            <Field label="Room Type">
              <ButtonGroup
                options={ROOM_TYPES}
                value={form.type}
                onChange={(v) => handleChange('type', v)}
              />
            </Field>

            <Field label="Capacity (Total Beds)">
              <input
                type="number"
                className="input sm:w-1/2"
                min="1"
                max="10"
                value={form.capacity}
                onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 1)}
              />
            </Field>
            
            <Field label="Status">
              <ButtonGroup
                options={STATUS_OPTIONS}
                value={form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                onChange={(v) => handleChange('status', v.toLowerCase())}
              />
            </Field>
          </Section>

           
          <Section title="Pricing" subtitle="Monthly rent and deposits">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Rent (per month)" required error={errors.rent}>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500 font-medium">₹</span>
                  <input
                    type="number"
                    className={`input pl-8 ${errors.rent ? 'input-error' : ''}`}
                    placeholder="e.g. 8500"
                    value={form.rent}
                    onChange={(e) => handleChange('rent', e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Security Deposit">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500 font-medium">₹</span>
                  <input
                    type="number"
                    className="input pl-8"
                    placeholder="e.g. 15000"
                    value={form.deposit}
                    onChange={(e) => handleChange('deposit', e.target.value)}
                  />
                </div>
              </Field>
            </div>
          </Section>

        
          <Section title="Features" subtitle="What is included in this room?">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => handleChange('isAC', !form.isAC)}
                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  form.isAC
                    ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-sm'
                    : 'border-border bg-surface-50 text-surface-600 hover:border-primary-300 hover:bg-white hover:text-surface-900 hover:shadow-sm'
                }`}
              >
                <Wind className={`w-6 h-6 ${form.isAC ? 'text-primary-500' : 'text-surface-400'}`} />
                Air Conditioning
              </button>
              
              <button
                type="button"
                onClick={() => handleChange('hasWiFi', !form.hasWiFi)}
                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  form.hasWiFi
                    ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-sm'
                    : 'border-border bg-surface-50 text-surface-600 hover:border-primary-300 hover:bg-white hover:text-surface-900 hover:shadow-sm'
                }`}
              >
                <Wifi className={`w-6 h-6 ${form.hasWiFi ? 'text-primary-500' : 'text-surface-400'}`} />
                Free WiFi
              </button>

              <button
                type="button"
                onClick={() => handleChange('hasAttachedBath', !form.hasAttachedBath)}
                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  form.hasAttachedBath
                    ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-sm'
                    : 'border-border bg-surface-50 text-surface-600 hover:border-primary-300 hover:bg-white hover:text-surface-900 hover:shadow-sm'
                }`}
              >
                <Bath className={`w-6 h-6 ${form.hasAttachedBath ? 'text-primary-500' : 'text-surface-400'}`} />
                Attached Bath
              </button>

              <button
                type="button"
                onClick={() => handleChange('hasFood', !form.hasFood)}
                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  form.hasFood
                    ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-sm'
                    : 'border-border bg-surface-50 text-surface-600 hover:border-primary-300 hover:bg-white hover:text-surface-900 hover:shadow-sm'
                }`}
              >
                <Utensils className={`w-6 h-6 ${form.hasFood ? 'text-primary-500' : 'text-surface-400'}`} />
                Food Included
              </button>
            </div>
          </Section>

         
          <Section title="Room Photos" subtitle="Upload up to 5 photos of this specific room.">
            <ImageUpload
              images={images}
              onChange={setImages}
              maxImages={5}
              label="Room Photos"
            />
          </Section>
        </form>
      )}

      
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-30 bg-white/80 backdrop-blur-md border-t border-border px-6 py-4 transition-all duration-300 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-end gap-4 max-w-7xl mx-auto">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2 min-w-[160px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode ? 'Update Room' : 'Save Room'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
