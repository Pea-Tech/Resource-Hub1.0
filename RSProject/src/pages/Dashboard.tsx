import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ResourceCard } from '../components/resources/ResourceCard';
import { ResourceForm } from '../components/resources/ResourceForm';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import type { Resource } from '../types';

export function Dashboard() {
  const [showForm, setShowForm] = React.useState(false);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: resources, isLoading: loadingResources } = useQuery({
    queryKey: ['user-resources', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          reviews (
            rating,
            comment
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Resource & { reviews: { rating: number; comment: string }[] })[];
    },
    enabled: !!user?.id,
  });

  const handleSubmit = async (data: Omit<Resource, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('resources')
        .insert([{ ...data, user_id: user.id, status: 'pending' }]);

      if (error) throw error;

      toast.success('Resource submitted successfully!');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['user-resources'] });
    } catch (error) {
      toast.error('Failed to submit resource. Please try again.');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!user?.id) throw new Error('User not authenticated');

      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Profile picture updated successfully');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (error) {
      toast.error('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async (formData: FormData) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      const updates = {
        full_name: formData.get('fullName'),
        bio: formData.get('bio'),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  if (loadingProfile || loadingResources) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
          >
            Edit Profile
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleProfileUpdate(new FormData(e.currentTarget));
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <div className="mt-1 flex items-center space-x-4">
                {profile?.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile'}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
                <label className="cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                  <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                defaultValue={profile?.full_name || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                name="bio"
                rows={3}
                defaultValue={profile?.bio || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Profile'}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xl">
                    {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {profile?.full_name || 'Anonymous User'}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            {profile?.bio && (
              <p className="text-gray-600">{profile.bio}</p>
            )}
          </div>
        )}
      </div>

      {/* Resources Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Resources</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </button>
        </div>

        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <ResourceForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources?.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              showActions={true}
              onDelete={async () => {
                try {
                  const { error } = await supabase
                    .from('resources')
                    .delete()
                    .eq('id', resource.id);

                  if (error) throw error;

                  toast.success('Resource deleted successfully');
                  queryClient.invalidateQueries({ queryKey: ['user-resources'] });
                } catch (error) {
                  toast.error('Failed to delete resource');
                }
              }}
            />
          ))}
        </div>

        {resources?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">You haven't submitted any resources yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}