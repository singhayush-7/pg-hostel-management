import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Save,
  Loader2,
  Wifi,
  Wind,
  Car,
  Camera,
  WashingMachine,
  Utensils,
  Dumbbell,
  Zap,
  Droplets,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

import ImageUpload from '../../components/ui/ImageUpload';
import {
  createProperty,
  updateProperty,
  fetchPropertyById,
  selectCurrentProperty,
  selectPropertyLoading,
  clearCurrentProperty,
} from '../../store/slices/propertySlice';

  
const PROPERTY_TYPES = ['PG', 'Hostel', 'Co-living'];
const GENDER_OPTIONS = ['Male', 'Female', 'Any'];

const AMENITIES = [
  { label: 'WiFi', icon: Wifi },
  { label: 'AC', icon: Wind },
  { label: 'Parking', icon: Car },
  { label: 'CCTV', icon: Camera },
  { label: 'Laundry', icon: WashingMachine },
  { label: 'Food', icon: Utensils },
  { label: 'Gym', icon: Dumbbell },
  { label: 'Power Backup', icon: Zap },
  { label: 'Water Purifier', icon: Droplets },
  { label: 'Security Guard', icon: Shield },
];

const DEFAULT_FORM = {
  name: '',
  type: 'PG',
  gender: 'Any',
  description: '',
  address: '',
  city: '',
  area: '',
  pincode: '',
  amenities: [],
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

 
export default function PropertyForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();  
  const isEditMode = Boolean(id);

  const currentProperty = useSelector(selectCurrentProperty);
  const isLoading = useSelector(selectPropertyLoading);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchPropertyById(id));
    }
    return () => {
      dispatch(clearCurrentProperty());
    };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentProperty) {
      setForm({
        name: currentProperty.name || '',
        type: currentProperty.type || 'PG',
        gender: currentProperty.gender || 'Any',
        description: currentProperty.description || '',
        address: currentProperty.address || '',
        city: currentProperty.city || '',
        area: currentProperty.area || '',
        pincode: currentProperty.pincode || '',
        amenities: currentProperty.amenities || [],
      });
     
      if (currentProperty.photos?.length) {
        setImages(
          currentProperty.photos.map((p) => ({
            preview: p.url,
            file: null,
            url: p.url,
          }))
        );
      }
    }
  }, [isEditMode, currentProperty]);

  
  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const toggleAmenity = useCallback((amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }, []);
 
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Property name is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'amenities') {
        value.forEach((a) => formData.append('amenities', a));
      } else {
        formData.append(key, value);
      }
    });
 
    images.forEach((img) => {
      if (img.file) {
        formData.append('photos', img.file);
      } else if (img.url) {
        formData.append('existingPhotos', img.url);
      }
    });

    try {
      let result;
      if (isEditMode) {
        result = await dispatch(updateProperty({ id, formData }));
        if (updateProperty.fulfilled.match(result)) {
          toast.success('Property updated successfully!');
          navigate('/owner/properties');
        } else {
          toast.error(result.payload || 'Failed to update property');
        }
      } else {
        result = await dispatch(createProperty(formData));
        if (createProperty.fulfilled.match(result)) {
          const newId = result.payload?.property?._id || result.payload?._id;
          toast.success('Property created! Now add some rooms.');
          navigate(newId ? `/owner/properties/${newId}/rooms` : '/owner/properties');
        } else {
          toast.error(result.payload || 'Failed to create property');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate('/owner/properties');

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
            {isEditMode ? 'Edit Property' : 'Add New Property'}
          </h1>
          <p className="text-surface-500 text-sm mt-1">
            {isEditMode
              ? 'Update your property details'
              : 'Fill in the details below to list your property'}
          </p>
        </div>
      </div>

      {isLoading && isEditMode && !currentProperty ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
       
          <Section
            title="Basic Information"
            subtitle="Core details about your property"
          >
            <div className="space-y-6">
              <Field label="Property Name" required error={errors.name}>
                <input
                  type="text"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Sunrise PG for Girls"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Property Type">
                  <ButtonGroup
                    options={PROPERTY_TYPES}
                    value={form.type}
                    onChange={(v) => handleChange('type', v)}
                  />
                </Field>

                <Field label="Gender Allowed">
                  <ButtonGroup
                    options={GENDER_OPTIONS}
                    value={form.gender}
                    onChange={(v) => handleChange('gender', v)}
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  className="input resize-none py-3"
                  placeholder="Describe your property — facilities, rules, nearby landmarks…"
                  rows={4}
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </Field>
            </div>
          </Section>
 
          <Section title="Location" subtitle="Where is your property located?">
            <div className="space-y-6">
              <Field label="Full Address" required error={errors.address}>
                <input
                  type="text"
                  className={`input ${errors.address ? 'input-error' : ''}`}
                  placeholder="Street address, building name, landmark"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="City" required error={errors.city}>
                  <input
                    type="text"
                    className={`input ${errors.city ? 'input-error' : ''}`}
                    placeholder="e.g. Bengaluru"
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </Field>
                <Field label="Area / Locality">
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Koramangala"
                    value={form.area}
                    onChange={(e) => handleChange('area', e.target.value)}
                  />
                </Field>
                <Field label="Pincode">
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 560001"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) =>
                      handleChange('pincode', e.target.value.replace(/\D/g, ''))
                    }
                  />
                </Field>
              </div>
            </div>
          </Section>

    
          <Section
            title="Amenities"
            subtitle="Select all facilities available at your property"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {AMENITIES.map(({ label, icon: Icon }) => {
                const isSelected = form.amenities.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleAmenity(label)}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-sm'
                        : 'border-border bg-surface-50 text-surface-600 hover:border-primary-300 hover:bg-white hover:text-surface-900 hover:shadow-sm'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        isSelected ? 'text-primary-500' : 'text-surface-400'
                      }`}
                    />
                    {label}
                  </button>
                );
              })}
            </div>
          </Section>
 
          <Section
            title="Photos"
            subtitle="Upload up to 5 photos of your property. The first photo will be the cover."
          >
            <ImageUpload
              images={images}
              onChange={setImages}
              maxImages={5}
              label="Property Photos"
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
                {isEditMode ? 'Update Property' : 'Save Property'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
