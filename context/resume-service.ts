import { createSupabaseClient } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export interface ResumeVersion {
  id: string;
  content: string;
  timestamp: string;
  name?: string;
  is_current?: boolean;
  user_id?: string;
}

export interface QuickAction {
  id: string;
  name: string;
  prompt: string;
  category?: string;
  created_at?: string;
  user_id?: string;
}

export class ResumeService {
  // Save a new version of the resume
  async saveResumeVersion(
    content: string,
    name?: string
  ): Promise<ResumeVersion | null> {
    try {
      const supabase = createSupabaseClient();

      console.log("Saving resume version, content length:", content.length);
      console.log("Version name:", name || "unnamed");

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No authenticated user found");
        throw new Error("User must be authenticated to save resume versions");
      }

      console.log("User ID for version save:", userData.user.id);

      // Insert the new version with explicit user_id
      const { data, error } = await supabase
        .from("resume_versions")
        .insert({
          content,
          name: name || `Version ${new Date().toLocaleString()}`,
          timestamp: new Date().toISOString(),
          user_id: userData.user.id,
        })
        .select();

      if (error) {
        console.error("Database error saving resume version:", error);
        throw error;
      }

      console.log("Resume version saved, response:", data);

      // Also update the master_resume in profiles for backward compatibility
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          master_resume: content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userData.user.id);

      if (profileError) {
        console.error("Error updating profile with resume:", profileError);
      } else {
        console.log("Profile master_resume updated");
      }

      return data ? (data[0] as ResumeVersion) : null;
    } catch (error) {
      console.error("Error saving resume version:", error);
      toast({
        title: "Error saving resume",
        description: "There was a problem saving your resume version.",
        variant: "destructive",
      });
      return null;
    }
  }

  // Get all versions of a user's resume
  async getResumeVersions(): Promise<ResumeVersion[]> {
    try {
      const supabase = createSupabaseClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.log("No authenticated user found for getResumeVersions");
        return [];
      }

      console.log("Getting resume versions for user:", userData.user.id);

      // Get versions for this specific user
      const { data, error } = await supabase
        .from("resume_versions")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Database error fetching resume versions:", error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} resume versions`);
      return (data as ResumeVersion[]) || [];
    } catch (error) {
      console.error("Error fetching resume versions:", error);
      return [];
    }
  }

  // Get the current version of the resume
  async getCurrentResume(): Promise<string> {
    try {
      const supabase = createSupabaseClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.log("No authenticated user found for getCurrentResume");
        return "";
      }

      // First try to get from resume_versions table
      const { data: versionData, error: versionError } = await supabase
        .from("resume_versions")
        .select("content")
        .eq("user_id", userData.user.id)
        .eq("is_current", true)
        .single();

      if (!versionError && versionData) {
        console.log("Found current resume version");
        return versionData.content;
      }

      console.log("No current resume version found, falling back to profile");

      // Fall back to profiles table if no current version
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("master_resume")
        .eq("id", userData.user.id)
        .single();

      if (profileError) {
        console.error("Database error fetching profile:", profileError);
        throw profileError;
      }

      return profileData?.master_resume || "";
    } catch (error) {
      console.error("Error fetching current resume:", error);
      return "";
    }
  }

  // Set a specific version as the current one
  async setCurrentVersion(versionId: string): Promise<boolean> {
    try {
      const supabase = createSupabaseClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No authenticated user found for setCurrentVersion");
        throw new Error("User must be authenticated to set current version");
      }

      console.log(
        `Setting version ${versionId} as current for user ${userData.user.id}`
      );

      // First set all to false for this user
      const { error: resetError } = await supabase
        .from("resume_versions")
        .update({ is_current: false })
        .eq("user_id", userData.user.id);

      if (resetError) {
        console.error("Database error resetting current versions:", resetError);
        throw resetError;
      }

      // Then set the selected one to true
      const { error: updateError } = await supabase
        .from("resume_versions")
        .update({ is_current: true })
        .eq("id", versionId)
        .eq("user_id", userData.user.id); // Extra safety check

      if (updateError) {
        console.error("Database error updating version:", updateError);
        throw updateError;
      }

      // Get the content to update the master_resume
      const { data, error: getError } = await supabase
        .from("resume_versions")
        .select("content")
        .eq("id", versionId)
        .eq("user_id", userData.user.id) // Safety check
        .single();

      if (getError) {
        console.error("Database error fetching version content:", getError);
        throw getError;
      }

      console.log("Updating profile master_resume with version content");

      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          master_resume: data.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userData.user.id);

      if (profileError) {
        console.error("Database error updating profile:", profileError);
        throw profileError;
      }

      console.log("Current version updated successfully");
      return true;
    } catch (error) {
      console.error("Error setting current version:", error);
      toast({
        title: "Error setting version",
        description: "There was a problem setting this version as current.",
        variant: "destructive",
      });
      return false;
    }
  }

  // Delete a resume version
  async deleteResumeVersion(versionId: string): Promise<boolean> {
    try {
      const supabase = createSupabaseClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No authenticated user found for deleteResumeVersion");
        throw new Error("User must be authenticated to delete resume versions");
      }

      console.log(
        `Deleting resume version ${versionId} for user ${userData.user.id}`
      );

      // Check if this is the current version first
      const { data, error: checkError } = await supabase
        .from("resume_versions")
        .select("is_current")
        .eq("id", versionId)
        .eq("user_id", userData.user.id) // Safety check
        .single();

      if (checkError) {
        console.error("Database error checking version:", checkError);
        throw checkError;
      }

      // Don't allow deleting the current version
      if (data?.is_current) {
        console.log("Cannot delete current version");
        toast({
          title: "Cannot delete current version",
          description: "Please set another version as current first.",
          variant: "destructive",
        });
        return false;
      }

      // Delete the version
      const { error: deleteError } = await supabase
        .from("resume_versions")
        .delete()
        .eq("id", versionId)
        .eq("user_id", userData.user.id); // Safety check

      if (deleteError) {
        console.error("Database error deleting version:", deleteError);
        throw deleteError;
      }

      console.log("Resume version deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting resume version:", error);
      toast({
        title: "Error deleting version",
        description: "There was a problem deleting this resume version.",
        variant: "destructive",
      });
      return false;
    }
  }

  // Save a custom quick action
  async saveQuickAction(
    action: Omit<QuickAction, "id" | "created_at">
  ): Promise<QuickAction | null> {
    try {
      const supabase = createSupabaseClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No authenticated user found for saveQuickAction");
        throw new Error("User must be authenticated to save quick actions");
      }

      console.log(
        `Saving quick action "${action.name}" for user ${userData.user.id}`
      );

      const { data, error } = await supabase
        .from("quick_action_presets")
        .insert({
          name: action.name,
          prompt: action.prompt,
          category: action.category || "custom",
          user_id: userData.user.id,
        })
        .select();

      if (error) {
        console.error("Database error saving quick action:", error);
        throw error;
      }

      console.log("Quick action saved successfully:", data);
      return data ? (data[0] as QuickAction) : null;
    } catch (error) {
      console.error("Error saving quick action:", error);
      toast({
        title: "Error saving quick action",
        description: "There was a problem saving your custom quick action.",
        variant: "destructive",
      });
      return null;
    }
  }

  // Get all quick actions for the user
  async getQuickActions(): Promise<QuickAction[]> {
    try {
      const supabase = createSupabaseClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.log("No authenticated user found for getQuickActions");
        return [];
      }

      console.log(`Getting quick actions for user ${userData.user.id}`);

      const { data, error } = await supabase
        .from("quick_action_presets")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Database error fetching quick actions:", error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} quick actions`);
      return (data as QuickAction[]) || [];
    } catch (error) {
      console.error("Error fetching quick actions:", error);
      return [];
    }
  }

  // Delete a quick action
  async deleteQuickAction(actionId: string): Promise<boolean> {
    try {
      const supabase = createSupabaseClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No authenticated user found for deleteQuickAction");
        throw new Error("User must be authenticated to delete quick actions");
      }

      console.log(
        `Deleting quick action ${actionId} for user ${userData.user.id}`
      );

      const { error } = await supabase
        .from("quick_action_presets")
        .delete()
        .eq("id", actionId)
        .eq("user_id", userData.user.id); // Safety check

      if (error) {
        console.error("Database error deleting quick action:", error);
        throw error;
      }

      console.log("Quick action deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting quick action:", error);
      toast({
        title: "Error deleting quick action",
        description: "There was a problem deleting this quick action.",
        variant: "destructive",
      });
      return false;
    }
  }
}
