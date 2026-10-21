/**
 * Pure, side-effect-free helpers for working with job postings.
 *
 * These operate on plain `Job[]` arrays (already loaded from the content
 * collection by the calling page) so they can be unit tested without the Astro
 * content runtime or a database.
 */
import type { Job } from '../types/job';

/** Return jobs sorted by posted date, newest first (does not mutate input). */
export function sortByNewest(jobs: Job[]): Job[] {
    return [...jobs].sort(
        (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(),
    );
}

/**
 * Format an ISO-8601 date as a human-readable posted date,
 * e.g. "January 5, 2027". Falls back to the raw value if unparseable.
 */
export function formatPostedDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

/** Selected filter values; an empty string means "All". */
export interface RoleFilterCriteria {
    /** Selected department name, or an empty string for all departments. */
    department: string;
    /** Selected location, or an empty string for all locations. */
    location: string;
}

/**
 * Collect the distinct departments from a list of jobs.
 *
 * @param jobs - Jobs to read departments from.
 * @returns Unique department names, sorted alphabetically.
 */
export function getDepartments(jobs: Job[]): string[] {
    return [...new Set(jobs.map((job) => job.department))].sort((a, b) => a.localeCompare(b));
}

/**
 * Collect the distinct locations from a list of jobs.
 *
 * @param jobs - Jobs to read locations from.
 * @returns Unique locations, sorted alphabetically.
 */
export function getLocations(jobs: Job[]): string[] {
    return [...new Set(jobs.map((job) => job.location))].sort((a, b) => a.localeCompare(b));
}

/**
 * Filter jobs by department and/or location. An empty value is ignored; when
 * both are set a job matches if it satisfies either one (OR).
 *
 * @typeParam T - Any object exposing a department and a location.
 * @param jobs - Items to filter (not mutated).
 * @param criteria - Selected department and location; empty strings mean "All".
 * @returns A new array of the matching items, in their original order.
 */
export function filterJobs<T extends Pick<Job, 'department' | 'location'>>(
    jobs: T[],
    criteria: RoleFilterCriteria,
): T[] {
    const { department, location } = criteria;
    if (!department && !location) {
        return [...jobs];
    }
    return jobs.filter(
        (job) =>
            (department !== '' && job.department === department) ||
            (location !== '' && job.location === location),
    );
}
