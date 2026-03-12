
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { Minifigure, UserProfile, ProfileProps } from '../types';
import SEO from '../components/SEO';

const Profile: React.FC<ProfileProps> = ({ user, onLogout, allMinifigs }) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const ownedCount = useMemo(() => allMinifigs.filter(m => m.owned).length, [allMinifigs]);
  const level = Math.floor(ownedCount / 100);

  useEffect(() => {
    if (user) getProfile();
  }, [user]);

  const getProfile = async () => {
    try {
      setLoading(true);
      if (!user) throw new Error("User not logged in");
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error: any) {
      console.error('Error loading user data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!user) throw new Error("User not logged in");
      const updates = {
        id: user.id,
        username,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      if (!user) throw new Error("User not logged in");
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      // Use a folder-based path which is more standard for RLS policies
      const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (data) {
        const publicUrl = `${data.publicUrl}?t=${new Date().getTime()}`;
        setAvatarUrl(publicUrl);
        
        // Ensure we include current username in the upsert to avoid violating RLS/constraints
        const { error: profileError } = await supabase.from('profiles').upsert({ 
          id: user.id, 
          username: username, // Important: include existing username
          avatar_url: publicUrl, 
          updated_at: new Date().toISOString() 
        });
        
        if (profileError) throw profileError;
      }
    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO 
        title="My Profile" 
        description="Manage your Minifig Hub profile and collection settings." 
        noindex={true}
      />
      <div className="max-w-md mx-auto p-6 pt-4">
        <form onSubmit={updateProfile} className="space-y-6">
          
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img src={avatarUrl || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user?.id}`} alt="Avatar" className="w-28 h-28 rounded-full object-cover bg-white border-4 border-white shadow-xl" />
              <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-indigo-700 transition-all shadow-md active:scale-90">
                {isUploading ? <i className="fas fa-spinner animate-spin text-sm"></i> : <i className="fas fa-camera text-sm"></i>}
                <input type="file" id="avatar-upload" accept="image/*" onChange={uploadAvatar} className="hidden" disabled={isUploading} />
              </label>
            </div>
            <div className="text-center -mt-1">
              <span className="bg-amber-400 text-amber-900 text-xs font-black px-3 py-1 rounded-lg leading-none shadow-md border border-amber-500/20">
                LEVEL {level}
              </span>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-2">{ownedCount.toLocaleString()} Figs Collected</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</label>
              <input id="email" type="text" value={user?.email || ''} disabled className="w-full h-12 px-4 bg-slate-100/80 border border-slate-200 rounded-xl font-bold text-sm text-slate-500" />
            </div>

            <div>
              <label htmlFor="username" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Username</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-black text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
            </div>
            
            <button type="submit" disabled={loading || isUploading} className="w-full h-14 bg-slate-900 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {loading ? <i className="fas fa-spinner animate-spin text-lg"></i> : 'Save Changes'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <button onClick={onLogout} className="w-full h-14 bg-rose-500/10 border-2 border-rose-500/10 text-rose-500 font-black uppercase text-xs tracking-[0.3em] rounded-2xl active:scale-95 transition-all">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
