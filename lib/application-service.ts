import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { ApplicationStatus, JobApplication } from "@/types/index";
import { v4 as uuidv4 } from "uuid";
import { initializeDatabase } from "./db-init";
import { createSupabaseClient as getSupabaseClient } from "./supabase";

// Singleton instance
let instance: ApplicationService | null = null;

// This service handles all application data operations via Supabase
export class ApplicationService {
  private initialized = false;
  private initializationAttempted = false;
  private supabaseClient: SupabaseClient | null = null;

  constructor() {
    // Enforce singleton pattern
    if (instance) {
      return instance;
    }
    // Initialize the Supabase client
    this.initClient();
    instance = this;
  }

  private initClient() {
    try {
      // Use the singleton pattern from lib/supabase.ts
      this.supabaseClient = getSupabaseClient();
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error);
      // Fallback for initialization errors
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      if (supabaseUrl && supabaseAnonKey) {
        this.supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        });
      }
    }
  }

  // Get the Supabase client
  private getClient() {
    if (!this.supabaseClient) {
      this.initClient();
      if (!this.supabaseClient) {
        throw new Error("Failed to initialize Supabase client");
      }
    }
    return this.supabaseClient;
  }

  // Initialize the database if needed
  private async ensureInitialized() {
    // Skip if we've already successfully initialized
    if (this.initialized) {
      return;
    }
    // Skip if we've already attempted initialization and failed
    if (this.initializationAttempted) {
      // Just continue without initialization
      console.warn(
        "Skipping database initialization as previous attempt failed"
      );
      return;
    }
    this.initializationAttempted = true;
    try {
      const success = await initializeDatabase();
      this.initialized = success;
      if (!success) {
        console.warn(
          "Database initialization was not successful, but continuing anyway"
        );
      }
    } catch (error) {
      console.error("Failed to initialize database:", error);
      // Don't throw, just continue without initialization
    }
  }

  // Get all applications
  async getApplications(): Promise<JobApplication[]> {
    try {
      // Try to ensure database is initialized, but continue even if it fails
      await this.ensureInitialized();
      const supabase = this.getClient();
      // First, get all applications
      const { data: applications, error: appError } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (appError) {
        // If we get a "relation does not exist" error, the tables might not be created
        if (
          appError.message.includes(
            'relation "public.applications" does not exist'
          )
        ) {
          console.warn(
            "Applications table doesn't exist, returning empty array"
          );
          return [];
        }
        throw appError;
      }
      if (!applications) return [];

      // Then get events and status history in separate queries
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .in(
          "application_id",
          applications.map((app) => app.id)
        );
      if (
        eventsError &&
        !eventsError.message.includes('relation "public.events" does not exist')
      ) {
        throw eventsError;
      }

      const { data: statusHistory, error: historyError } = await supabase
        .from("status_history")
        .select("*")
        .in(
          "application_id",
          applications.map((app) => app.id)
        );
      if (
        historyError &&
        !historyError.message.includes(
          'relation "public.status_history" does not exist'
        )
      ) {
        throw historyError;
      }

      // Map the data to match the JobApplication interface
      return applications.map((app) => {
        // Find events for this application
        const appEvents =
          events?.filter((event) => event.application_id === app.id) || [];
        // Find status history for this application
        const appStatusHistory =
          statusHistory?.filter(
            (history) => history.application_id === app.id
          ) || [];

        return {
          id: app.id,
          companyName: app.company_name,
          positionTitle: app.position_title,
          location: app.location || "",
          jobDescription: app.job_description || "",
          status: app.status as ApplicationStatus,
          dateAdded: app.date_added,
          dateApplied: app.date_applied || undefined,
          salary: app.salary || undefined,
          notes: app.notes || undefined,
          contactName: app.contact_name || undefined,
          contactEmail: app.contact_email || undefined,
          contactPhone: app.contact_phone || undefined,
          url: app.url || undefined,
          tags: app.tags || [],
          statusHistory: appStatusHistory.map((history) => ({
            status: history.status as ApplicationStatus,
            date: history.date,
            notes: history.notes,
          })),
          events: appEvents.map((event) => ({
            id: event.id,
            title: event.title,
            date: event.date,
            type: event.type,
            notes: event.notes,
            location: event.location,
            isCompleted: event.is_completed,
          })),
        };
      });
    } catch (error) {
      console.error("Error retrieving applications:", error);
      throw error;
    }
  }

  // Get application by ID - support both string and number IDs
  async getApplicationById(
    id: string | number
  ): Promise<JobApplication | null> {
    try {
      // Try to ensure database is initialized, but continue even if it fails
      await this.ensureInitialized();
      const supabase = this.getClient();

      // Convert ID to string for consistency
      const stringId = String(id);

      // Get application by ID
      const { data: application, error: appError } = await supabase
        .from("applications")
        .select("*")
        .eq("id", stringId)
        .single();
      if (appError) {
        // If we get a "relation does not exist" error, the tables might not be created
        if (
          appError.message.includes(
            'relation "public.applications" does not exist'
          )
        ) {
          console.warn("Applications table doesn't exist, returning null");
          return null;
        }
        throw appError;
      }
      if (!application) return null;

      // Get events for this application
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("application_id", stringId);
      if (
        eventsError &&
        !eventsError.message.includes('relation "public.events" does not exist')
      ) {
        throw eventsError;
      }

      // Get status history for this application
      const { data: statusHistory, error: historyError } = await supabase
        .from("status_history")
        .select("*")
        .eq("application_id", stringId);
      if (
        historyError &&
        !historyError.message.includes(
          'relation "public.status_history" does not exist'
        )
      ) {
        throw historyError;
      }

      // Transform the data to match the JobApplication interface
      return {
        id: application.id,
        companyName: application.company_name,
        positionTitle: application.position_title,
        location: application.location || "",
        jobDescription: application.job_description || "",
        status: application.status as ApplicationStatus,
        dateAdded: application.date_added,
        dateApplied: application.date_applied || undefined,
        salary: application.salary || undefined,
        notes: application.notes || undefined,
        contactName: application.contact_name || undefined,
        contactEmail: application.contact_email || undefined,
        contactPhone: application.contact_phone || undefined,
        url: application.url || undefined,
        tags: application.tags || [],
        statusHistory:
          statusHistory?.map((history) => ({
            status: history.status as ApplicationStatus,
            date: history.date,
            notes: history.notes,
          })) || [],
        events:
          events?.map((event) => ({
            id: event.id,
            title: event.title,
            date: event.date,
            type: event.type,
            notes: event.notes,
            location: event.location,
            isCompleted: event.is_completed,
          })) || [],
      };
    } catch (error) {
      console.error(`Error retrieving application ${id}:`, error);
      throw error;
    }
  }

  // Save application - UPDATED to handle string and number IDs
  async saveApplication(
    application: JobApplication
  ): Promise<{ id: string } | boolean> {
    try {
      // Try to ensure database is initialized, but continue even if it fails
      await this.ensureInitialized();
      const supabase = this.getClient();

      // Get the current user session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      // Transform the application to match the database schema
      const dbApplication = {
        id: application.id || uuidv4(),
        company_name: application.companyName,
        position_title: application.positionTitle,
        location: application.location,
        job_description: application.jobDescription,
        status: application.status,
        date_added: application.dateAdded,
        date_applied: application.dateApplied,
        salary: application.salary,
        notes: application.notes,
        contact_name: application.contactName,
        contact_email: application.contactEmail,
        contact_phone: application.contactPhone,
        url: application.url,
        tags: application.tags,
        user_id: session.user.id,
      };

      // Check if application exists
      const { data: existingApp, error: checkError } = await supabase
        .from("applications")
        .select("id")
        .eq("id", String(dbApplication.id))
        .maybeSingle();
      if (
        checkError &&
        !checkError.message.includes(
          'relation "public.applications" does not exist'
        )
      ) {
        throw checkError;
      }

      if (existingApp) {
        // Update existing application - RLS will ensure user can only update their own data
        const { error } = await supabase
          .from("applications")
          .update(dbApplication)
          .eq("id", String(dbApplication.id));
        if (error) throw error;
      } else {
        // Insert new application
        const { error } = await supabase
          .from("applications")
          .insert(dbApplication);
        if (error) throw error;
      }

      // Handle status history if provided
      if (application.statusHistory && application.statusHistory.length > 0) {
        // Get the latest status history entry
        const latestStatus =
          application.statusHistory[application.statusHistory.length - 1];
        // Check if this status already exists in the database
        const { data: existingStatus, error: statusCheckError } = await supabase
          .from("status_history")
          .select("id")
          .eq("application_id", String(dbApplication.id))
          .eq("status", latestStatus.status)
          .eq("date", latestStatus.date)
          .maybeSingle();
        if (
          statusCheckError &&
          !statusCheckError.message.includes(
            'relation "public.status_history" does not exist'
          )
        ) {
          throw statusCheckError;
        }
        if (!existingStatus) {
          // Insert new status history
          const { error } = await supabase.from("status_history").insert({
            application_id: String(dbApplication.id),
            status: latestStatus.status,
            date: latestStatus.date,
            notes: latestStatus.notes,
            user_id: session.user.id,
          });
          if (
            error &&
            !error.message.includes(
              'relation "public.status_history" does not exist'
            )
          ) {
            throw error;
          }
        }
      }

      // Return the ID along with success
      return { id: String(dbApplication.id) };
    } catch (error) {
      console.error("Error saving application:", error);
      throw error;
    }
  }

  // Delete application - UPDATED to handle string and number IDs
  async deleteApplication(id: string | number): Promise<boolean> {
    try {
      // Try to ensure database is initialized, but continue even if it fails
      await this.ensureInitialized();
      const supabase = this.getClient();

      // Convert ID to string for consistency
      const stringId = String(id);

      // Delete application - RLS will ensure user can only delete their own data
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", stringId);
      if (
        error &&
        !error.message.includes('relation "public.applications" does not exist')
      ) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error(`Error deleting application ${id}:`, error);
      throw error;
    }
  }

  // Update application status - UPDATED to handle string and number IDs
  async updateApplicationStatus(
    id: string | number,
    status: ApplicationStatus,
    notes?: string
  ): Promise<boolean> {
    try {
      // Try to ensure database is initialized, but continue even if it fails
      await this.ensureInitialized();
      const supabase = this.getClient();

      // Convert ID to string for consistency
      const stringId = String(id);

      // Get the current user session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      // Update application status - RLS will ensure user can only update their own data
      const { error: updateError } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", stringId);
      if (
        updateError &&
        !updateError.message.includes(
          'relation "public.applications" does not exist'
        )
      ) {
        throw updateError;
      }

      // Add to status history
      const now = new Date().toISOString();
      const { error: historyError } = await supabase
        .from("status_history")
        .insert({
          application_id: stringId,
          status,
          date: now,
          notes,
          user_id: session.user.id,
        });
      if (
        historyError &&
        !historyError.message.includes(
          'relation "public.status_history" does not exist'
        )
      ) {
        throw historyError;
      }
      return true;
    } catch (error) {
      console.error(`Error updating status for application ${id}:`, error);
      throw error;
    }
  }

  // Add event to application - UPDATED to handle string and number IDs
  async addEvent(
    applicationId: string | number,
    event: JobApplication["events"][0]
  ): Promise<boolean> {
    try {
      // Try to ensure database is initialized, but continue even if it fails
      await this.ensureInitialized();
      const supabase = this.getClient();

      // Convert ID to string for consistency
      const stringAppId = String(applicationId);

      // Get the current user session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      // Transform the event to match the database schema
      const dbEvent = {
        id: event.id || uuidv4(),
        application_id: stringAppId,
        title: event.title,
        date: event.date,
        type: event.type,
        notes: event.notes,
        location: event.location,
        is_completed: event.isCompleted || false,
        user_id: session.user.id,
      };

      // Insert event - RLS will ensure user can only add events to their own applications
      const { error } = await supabase.from("events").insert(dbEvent);
      if (
        error &&
        !error.message.includes('relation "public.events" does not exist')
      ) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error(
        `Error adding event to application ${applicationId}:`,
        error
      );
      throw error;
    }
  }
}
