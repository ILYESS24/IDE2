/**
 * @fileoverview Database type definitions for Supabase and application data
 * 
 * These types represent the core data structures used throughout the application.
 * They are designed to be compatible with both Supabase database schema and
 * TypeScript strict mode.
 * 
 * @module types/database
 */

// ============================================
// BASE TYPES & UTILITIES
// ============================================

/** ISO 8601 date string format */
export type ISODateString = string;

/** UUID string format */
export type UUID = string;

/** Priority levels for tasks */
export type Priority = 'low' | 'medium' | 'high';

/** Task status options */
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

/** Project status options */
export type ProjectStatus = 'active' | 'completed' | 'archived' | 'in_progress' | 'pending';

/** Project type categories */
export type ProjectType = 'video' | 'image' | 'code' | 'website' | 'agent' | 'app';

/** Generation content types */
export type GenerationType = 'image' | 'video' | 'text';

/** Generation status */
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** Employee availability status */
export type EmployeeStatus = 'active' | 'offline' | 'vacation';

/** Candidate hiring stage */
export type CandidateStage = 'applied' | 'screening' | 'interview' | 'offer';

/** Device types */
export type DeviceType = 'laptop' | 'phone' | 'monitor' | 'other';

/** Device status */
export type DeviceStatus = 'active' | 'maintenance' | 'available';

/** Notification severity levels */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// ============================================
// USER & AUTHENTICATION
// ============================================

/**
 * User profile information
 */
export interface User {
  readonly id: UUID;
  readonly email: string;
  readonly full_name?: string;
  readonly avatar_url?: string;
}

// ============================================
// TASK MANAGEMENT
// ============================================

/**
 * Task entity with full details
 */
export interface Task {
  readonly id: UUID;
  readonly user_id: UUID;
  readonly title: string;
  readonly completed: boolean;
  readonly priority: Priority;
  readonly created_at: ISODateString;
  readonly updated_at: ISODateString;
  /** Detailed status (optional, derived from completed) */
  readonly status?: TaskStatus;
  /** Due date for the task */
  readonly due_date?: ISODateString;
  /** Task description */
  readonly description?: string;
}

/**
 * Data required to create a new task
 */
export type CreateTaskInput = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

/**
 * Data that can be updated on a task
 */
export type UpdateTaskInput = Partial<Pick<Task, 'title' | 'completed' | 'priority' | 'status' | 'due_date' | 'description'>>;

// ============================================
// CALENDAR & EVENTS
// ============================================

/**
 * Calendar event entity
 */
export interface Event {
  readonly id: UUID;
  readonly user_id: UUID;
  readonly title: string;
  readonly start_time: ISODateString;
  readonly end_time?: ISODateString;
  readonly color?: string;
  readonly created_at: ISODateString;
  readonly description?: string;
}

/**
 * Data required to create a new event
 */
export type CreateEventInput = Omit<Event, 'id' | 'user_id' | 'created_at'>;

// ============================================
// AI GENERATIONS
// ============================================

/**
 * Generation metadata structure
 * Known properties are typed, additional properties must be strings
 */
export interface GenerationMetadata {
  readonly style?: string;
  readonly model?: string;
  readonly resolution?: string;
  readonly duration?: number;
  /** Additional string metadata */
  readonly [key: string]: string | number | undefined;
}

/**
 * AI generation entity
 */
export interface Generation {
  readonly id: UUID;
  readonly user_id: UUID;
  readonly type: GenerationType;
  readonly prompt: string;
  readonly result_url?: string | null;
  readonly status: GenerationStatus;
  readonly metadata?: GenerationMetadata;
  readonly created_at: ISODateString;
}

/**
 * Data required to create a new generation
 */
export type CreateGenerationInput = Pick<Generation, 'type' | 'prompt'> & {
  readonly metadata?: GenerationMetadata;
};

// ============================================
// PROJECTS
// ============================================

/**
 * Project entity
 */
export interface Project {
  readonly id: UUID;
  readonly title: string;
  readonly status: ProjectStatus;
  readonly progress: number;
  readonly members: readonly string[];
  readonly image?: string;
  readonly description?: string;
  readonly type?: ProjectType;
  readonly created_at?: ISODateString;
  readonly updated_at: ISODateString;
}

/**
 * Data required to create a new project
 */
export type CreateProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>;

// ============================================
// HR & TEAM MANAGEMENT
// ============================================

/**
 * Employee entity
 */
export interface Employee {
  readonly id: UUID;
  readonly name: string;
  readonly role: string;
  readonly department: string;
  readonly status: EmployeeStatus;
  readonly avatar: string;
  readonly salary: number;
  readonly join_date: ISODateString;
}

/**
 * Job candidate entity
 */
export interface Candidate {
  readonly id: UUID;
  readonly name: string;
  readonly role: string;
  readonly stage: CandidateStage;
  readonly score: number;
  readonly avatar: string;
  readonly applied_date: ISODateString;
}

// ============================================
// ASSETS & DEVICES
// ============================================

/**
 * Device/equipment entity
 */
export interface Device {
  readonly id: UUID;
  readonly name: string;
  readonly type: DeviceType;
  readonly assigned_to?: UUID;
  readonly status: DeviceStatus;
  readonly purchase_date: ISODateString;
  readonly serial: string;
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Notification entity
 */
export interface Notification {
  readonly id: UUID;
  readonly title: string;
  readonly message: string;
  readonly type: NotificationType;
  readonly read: boolean;
  readonly date: ISODateString;
}

// ============================================
// COMMUNITY
// ============================================

/**
 * Author information for community posts
 */
export interface PostAuthor {
  readonly name: string;
  readonly avatar: string;
}

/**
 * Community post entity
 */
export interface CommunityPost {
  readonly id: UUID;
  readonly author: PostAuthor;
  readonly title: string;
  readonly content: string;
  readonly likes: number;
  readonly comments: number;
  readonly tags: readonly string[];
  readonly date: ISODateString;
}

// ============================================
// DASHBOARD STATISTICS
// ============================================

/**
 * Dashboard statistics state
 */
export interface StatsState {
  readonly revenue: string;
  readonly users: string;
  readonly bounceRate: string;
  readonly interviews?: number;
  readonly hired?: number;
  readonly onboardingProgress?: number;
  readonly output?: number;
  readonly employees?: number;
  readonly hirings?: number;
  readonly projects?: number;
  readonly weeklyHours?: number;
}

// ============================================
// TIME TRACKING
// ============================================

/**
 * Time entry for tracking work
 */
export interface TimeEntry {
  readonly id: UUID;
  readonly task_id?: UUID;
  readonly start_time: ISODateString;
  readonly end_time?: ISODateString;
  readonly duration?: number;
}

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Type guard for Task
 */
export function isTask(obj: unknown): obj is Task {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'completed' in obj
  );
}

/**
 * Type guard for Generation
 */
export function isGeneration(obj: unknown): obj is Generation {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'type' in obj &&
    'prompt' in obj &&
    'status' in obj
  );
}
