import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ResourceCard } from '../components/resources/ResourceCard';
import { AnalyticsCard } from '../components/analytics/AnalyticsCard';
import { Users, BookOpen, CheckCircle, XCircle, Edit, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Resource } from '../types';

interface UserWithProfile {
  id: string;
  email: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: 'user' | 'admin';
  };
}

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<'resources' | 'users'>('resources');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);

  const { data: resources, isLoading: loadingResources } = useQuery({
    queryKey: ['admin-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Resource[];
    },
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      if (profilesError) throw profilesError;

      const combinedUsers = authUsers.users.map(user => ({
        id: user.id,
        email: user.email,
        profiles: profiles.find(p => p.id === user.id) || {
          id: user.id,
          full_name: '',
          role: 'user' as const
        }
      })).filter(user => 
        !searchTerm || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profiles.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return combinedUsers as UserWithProfile[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [users, resources, pending, approved, rejected] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('resources').select('id', { count: 'exact' }),
        supabase.from('resources').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('resources').select('id', { count: 'exact' }).eq('status', 'approved'),
        supabase.from('resources').select('id', { count: 'exact' }).eq('status', 'rejected')
      ]);

      return {
        users: users.count || 0,
        total: resources.count || 0,
        pending: pending.count || 0,
        approved: approved.count || 0,
        rejected: rejected.count || 0
      };
    }
  });

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Resource ${status} successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    } catch (error) {
      toast.error('Failed to update resource status');
    }
  };

  const handleUserUpdate = async (userId: string, data: Partial<UserWithProfile['profiles']>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);

      if (error) throw error;

      toast.success('User updated successfully');
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  if (loadingResources || loadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <AnalyticsCard
          title="Total Users"
          value={stats?.users || 0}
          icon={<Users className="h-6 w-6" />}
        />
        <AnalyticsCard
          title="Total Resources"
          value={stats?.total || 0}
          icon={<BookOpen className="h-6 w-6" />}
        />
        <AnalyticsCard
          title="Pending"
          value={stats?.pending || 0}
          icon={<BookOpen className="h-6 w-6" />}
        />
        <AnalyticsCard
          title="Approved"
          value={stats?.approved || 0}
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <AnalyticsCard
          title="Rejected"
          value={stats?.rejected || 0}
          icon={<XCircle className="h-6 w-6" />}
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setSelectedTab('resources')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                selectedTab === 'resources'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setSelectedTab('users')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                selectedTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'resources' ? (
            <div className="space-y-6">
              {resources?.map((resource) => (
                <div key={resource.id} className="flex items-start space-x-4">
                  <div className="flex-1">
                    <ResourceCard resource={resource} showActions={false} />
                  </div>
                  <div className="flex space-x-2">
                    {resource.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(resource.id, 'approved')}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(resource.id, 'rejected')}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {resources?.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No resources found
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users?.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.profiles.avatar_url && (
                              <img
                                src={user.profiles.avatar_url}
                                alt=""
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.profiles.full_name || 'Unnamed User'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser?.id === user.id ? (
                            <select
                              value={editingUser.profiles.role}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                profiles: { ...editingUser.profiles, role: e.target.value as 'user' | 'admin' }
                              })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.profiles.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.profiles.role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingUser?.id === user.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUserUpdate(user.id, editingUser.profiles)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingUser(user)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}