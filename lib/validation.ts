import { z } from "zod";

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
});
// Type for the login form values
export type LoginFormValues = z.infer<typeof loginSchema>;
// Define schemas for different data types
export const applicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  positionTitle: z.string().min(1, "Position title is required"),
  location: z.string().optional(),
  jobDescription: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  salary: z.string().optional(),
  notes: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
});

export const eventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  date: z.string().min(1, "Date is required"),
  type: z.string().min(1, "Event type is required"),
  notes: z.string().optional(),
  location: z.string().optional(),
});

export const searchQuerySchema = z.object({
  query: z.string().trim().min(1, "Search query is required"),
});

// Utility function to sanitize input
export function sanitizeInput(input: string): string {
  // Basic sanitization to prevent XSS
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Validate application data
export function validateApplication(data: unknown) {
  return applicationSchema.parse(data);
}

// Validate event data
export function validateEvent(data: unknown) {
  return eventSchema.parse(data);
}

// Validate search query
export function validateSearchQuery(query: string) {
  return searchQuerySchema.parse({ query }).query;
}
