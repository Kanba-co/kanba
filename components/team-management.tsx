'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  MoreHorizontal, 
  Mail, 
  Crown, 
  Shield, 
  User,
  Loader2,
  Trash2,
  AlertCircle,
  Search,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

interface ProjectMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  invited_at: string;
  joined_at: string | null;
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface TeamManagementProps {
  projectId: string;
  userSubscriptionStatus: 'free' | 'pro' | null;
  isProjectOwner: boolean;
}

export function TeamManagement({ projectId, userSubscriptionStatus, isProjectOwner }: TeamManagementProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [inviting, setInviting] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  const loadMembers = async () => {
    try {
      const { data: members, error } = await supabase
        .from('project_members_with_profiles')
        .select(`
          id,
          project_id,
          user_id,
          role,
          created_at,
          updated_at,
          profile_id,
          profile_email,
          profile_full_name,
          profile_avatar_url
        `)
        .eq('project_id', projectId)
        .order('created_at');

      if (error) throw error;
      
      // Transform data to match existing interface
      const transformedMembers = (members || []).map(member => ({
        id: member.id,
        project_id: member.project_id,
        user_id: member.user_id,
        role: member.role,
        created_at: member.created_at,
        updated_at: member.updated_at,
        profiles: {
          id: member.profile_id,
          email: member.profile_email,
          full_name: member.profile_full_name,
          avatar_url: member.profile_avatar_url
        }
      }));
      
      // Varsayılan değerlerle eksik alanları ekleyerek transformedMembers'ı düzeltiyoruz
      const completeMembers = transformedMembers.map(member => ({
        ...member,
        invited_at: member.created_at, // invited_at için created_at kullanıyoruz
        joined_at: member.created_at // joined_at için created_at kullanıyoruz
      }));

      setMembers(completeMembers);
    } catch (error: any) {
      console.error('Error loading members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const debugUserSearch = async () => {
    try {
      console.log('🔍 Starting debug search...');
      
      // Test RPC function with generic search
      const { data: allProfiles, error: allProfilesError } = await supabase
        .rpc('search_users_for_collaboration', { search_term: 'a' }); // Search for users with 'a'
      
      console.log('📊 All profiles via RPC:', { allProfiles, error: allProfilesError });
      
      // Test specific search
      const { data: searchProfiles, error: searchError } = await supabase
        .rpc('search_users_for_collaboration', { search_term: 'test' });
      
      console.log('🔍 Search profiles via RPC:', { searchProfiles, error: searchError });
      
      // Get current user info
      const { data: { user }, error: currentUserError } = await supabase.auth.getUser();
      console.log('🔐 Current user:', { user: user?.email, error: currentUserError });
      
      // Check RLS policies
      const { data: rlsTest, error: rlsError } = await supabase
        .rpc('get_profiles_count');
      
      console.log('🛡️ Profiles count test:', { rlsTest, error: rlsError });
      
      setDebugInfo({
        allProfilesCount: allProfiles?.length || 0,
        searchProfilesCount: searchProfiles?.length || 0,
        allProfiles: allProfiles?.slice(0, 3),
        searchProfiles: searchProfiles?.slice(0, 3),
        currentUser: user?.email,
        allProfilesError: allProfilesError?.message,
        searchError: searchError?.message,
        rlsError: rlsError?.message
      });
      
      toast.success('Debug info updated! Check console for detailed logs.');
    } catch (error: any) {
      console.error('Debug error:', error);
      toast.error('Debug failed: ' + error.message);
    }
  };

  const searchUsers = async (email: string) => {
    if (!email.trim() || email.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      console.log('🔍 Searching for users with term:', email);
      
      // Search for users using secure RPC function
      const { data: users, error } = await supabase
        .rpc('search_users_for_collaboration', { search_term: email.trim() });

      console.log('📊 Search results:', { users, error, searchTerm: email });

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      // Filter out users who are already members
      const existingMemberIds = members.map(m => m.user_id);
      const availableUsers = (users || []).filter((user: { id: string }) => 
        !existingMemberIds.includes(user.id)
      );

      console.log('✅ Available users after filtering:', availableUsers);
      setSearchResults(availableUsers);
    } catch (error: any) {
      console.error('Error searching users:', error);
      toast.error('Search failed: ' + error.message);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleEmailChange = (email: string) => {
    setInviteEmail(email);
    searchUsers(email);
  };

  const selectUser = (user: any) => {
    setInviteEmail(user.email);
    setSearchResults([]);
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Team collaboration artık herkese açık - güvenlik profiles RLS ile sağlanıyor

    setInviting(true);

    try {
      console.log('🚀 Attempting to invite user:', inviteEmail);
      
      // Search for user by exact email match using secure RPC function
      const { data: users, error: userError } = await supabase
        .rpc('search_users_for_collaboration', { search_term: inviteEmail.trim() });
      
      // Tam eşleşen email adresini sonuçlardan bul
      const existingUser = users?.find((user: { email: string; id: string }) => 
        user.email.toLowerCase() === inviteEmail.trim().toLowerCase()
      ) || null;

      console.log('👤 Kullanıcı arama sonucu:', { existingUser, error: userError });

      if (userError) {
        console.error('User lookup error:', userError);
        toast.error('Failed to search for user: ' + userError.message);
        return;
      }

      if (!existingUser) {
        toast.error(
          `No user found with email "${inviteEmail}". They need to create a Kanban account first.`,
          {
            description: 'Ask them to sign up first, then try adding them again.',
            duration: 6000,
          }
        );
        return;
      }

      // RPC function artık profiles'dan arama yaptığı için ek kontrol gerekmez

      // Check if user is already a member
      const { data: existingMember, error: memberError } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', existingUser.id)
        .single();

      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }

      if (existingMember) {
        toast.error('User is already a member of this project');
        return;
      }

      // Add user as project member
      const { error: inviteError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: existingUser.id,
          role: inviteRole,
          invited_by: (await supabase.auth.getUser()).data.user?.id,
          joined_at: new Date().toISOString(),
        });

      if (inviteError) throw inviteError;

      toast.success(`${existingUser.full_name || existingUser.email} has been added to the project!`);
      
      // Reset form
      setInviteEmail('');
      setInviteRole('member');
      setSearchResults([]);
      setInviteDialogOpen(false);
      
      // Reload members
      await loadMembers();
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast.error(error.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success(`${memberName} has been removed from the project`);
      await loadMembers();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'member', memberName: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast.success(`${memberName}'s role has been updated to ${newRole}`);
      await loadMembers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Members
            </CardTitle>
            <CardDescription>
              Manage who has access to this project
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Debug button - remove in production */}
            
            
            {isProjectOwner && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Search for existing Kanba users by email to add them to your project.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteMember} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Search by Email *</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Start typing an email address..."
                          value={inviteEmail}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          className="pl-10"
                          required
                        />
                        {searching && (
                          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      
                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <div className="border rounded-md bg-background shadow-sm">
                          <div className="p-2 text-xs text-muted-foreground border-b bg-green-50 dark:bg-green-950/10">
                            <div className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                              Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}:
                            </div>
                          </div>
                          {searchResults.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => selectUser(user)}
                              className="w-full p-3 text-left hover:bg-muted/50 flex items-center space-x-3 border-b last:border-b-0"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src='' alt={user.full_name || user.email || ''} />
                                <AvatarFallback className="text-xs">
                                  {user.full_name 
                                    ? user.full_name.charAt(0).toUpperCase() 
                                    : user.email 
                                      ? user.email.charAt(0).toUpperCase()
                                      : '?'
                                  }
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {user.full_name || user.email}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {user.email}
                                </p>
                                {/* subscription_status artık user_search view'inde yok */}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No results message */}
                      {inviteEmail.length >= 2 && !searching && searchResults.length === 0 && (
                        <div className="border rounded-md bg-amber-50 dark:bg-amber-950/10 p-3">
                          <div className="flex items-center text-amber-800 dark:text-amber-200">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <div>
                              <p className="text-sm font-medium">No users found</p>
                              <p className="text-xs">
                                The person needs to create a Kanba account first.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Only users who already have Kanba accounts can be added to projects.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={inviteRole} onValueChange={(value: 'admin' | 'member') => setInviteRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Member - Can view and edit tasks
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 mr-2" />
                              Admin - Can manage project and members
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={inviting || !inviteEmail.trim()} className="flex-1">
                        {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Mail className="mr-2 h-4 w-4" />
                        Add to Project
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setInviteDialogOpen(false);
                        setInviteEmail('');
                        setSearchResults([]);
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Team collaboration artık herkese açık */}

        {/* Debug Info Display */}
        {debugInfo && (
          <div className="bg-blue-50 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Debug Information</h4>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p>All profiles count: {debugInfo.allProfilesCount}</p>
              <p>Search profiles count: {debugInfo.searchProfilesCount}</p>
              <p>Current user: {debugInfo.currentUser}</p>
              {debugInfo.allProfilesError && <p className="text-red-600">All profiles error: {debugInfo.allProfilesError}</p>}
              {debugInfo.searchError && <p className="text-red-600">Search error: {debugInfo.searchError}</p>}
              {debugInfo.rlsError && <p className="text-red-600">RLS error: {debugInfo.rlsError}</p>}
              {debugInfo.allProfiles && (
                <details className="mt-2">
                  <summary className="cursor-pointer">All profiles sample</summary>
                  <pre className="mt-1 text-xs bg-blue-100 dark:bg-blue-900 p-2 rounded">
                    {JSON.stringify(debugInfo.allProfiles, null, 2)}
                  </pre>
                </details>
              )}
              {debugInfo.searchProfiles && (
                <details className="mt-2">
                  <summary className="cursor-pointer">Search profiles sample</summary>
                  <pre className="mt-1 text-xs bg-blue-100 dark:bg-blue-900 p-2 rounded">
                    {JSON.stringify(debugInfo.searchProfiles, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.profiles?.avatar_url || ''} alt={member.profiles?.full_name || member.profiles?.email || ''} />
                  <AvatarFallback>
                    {member.profiles?.full_name 
                      ? member.profiles.full_name.charAt(0).toUpperCase() 
                      : member.profiles?.email 
                        ? member.profiles.email.charAt(0).toUpperCase()
                        : '?'
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">
                      {member.profiles?.full_name || member.profiles?.email || 'Unknown User'}
                    </p>
                    <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                      <span className="flex items-center">
                        {getRoleIcon(member.role)}
                        <span className="ml-1 capitalize">{member.role}</span>
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {member.profiles?.email || 'Email yok'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.joined_at 
                      ? `Joined ${new Date(member.joined_at).toLocaleDateString()}`
                      : `Invited ${new Date(member.invited_at).toLocaleDateString()}`
                    }
                  </p>
                </div>
              </div>

              {isProjectOwner && member.role !== 'owner' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {member.role !== 'admin' && (
                      <DropdownMenuItem 
                        onClick={() => handleUpdateRole(member.id, 'admin', member.profiles?.full_name || member.profiles?.email || 'Bilinmeyen Kullanıcı')}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Make Admin
                      </DropdownMenuItem>
                    )}
                    {member.role === 'admin' && (
                      <DropdownMenuItem 
                        onClick={() => handleUpdateRole(member.id, 'member', member.profiles?.full_name || member.profiles?.email || 'Bilinmeyen Kullanıcı')}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Make Member
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => handleRemoveMember(member.id, member.profiles?.full_name || member.profiles?.email || 'Bilinmeyen Kullanıcı')}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}

          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No team members yet</p>
              <p className="text-sm">Invite team members to collaborate on this project</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}