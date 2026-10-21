import { describe, it, expect } from 'vitest';
import { sortByNewest, formatPostedDate, getDepartments, getLocations, filterJobs } from './jobs';
import type { Job } from '../types/job';

function makeJob(slug: string, postedDate: string): Job {
    return {
        slug,
        title: `Role ${slug}`,
        department: 'Technology',
        location: 'Remote',
        type: 'Full-time',
        remote: true,
        postedDate,
        summary: 'A role.',
    };
}

describe('sortByNewest', () => {
    it('orders jobs by posted date, newest first', () => {
        const jobs = [
            makeJob('a', '2027-01-01'),
            makeJob('b', '2027-03-15'),
            makeJob('c', '2027-02-10'),
        ];
        expect(sortByNewest(jobs).map((j) => j.slug)).toEqual(['b', 'c', 'a']);
    });

    it('does not mutate the input array', () => {
        const jobs = [makeJob('a', '2027-01-01'), makeJob('b', '2027-03-15')];
        const original = jobs.map((j) => j.slug);
        sortByNewest(jobs);
        expect(jobs.map((j) => j.slug)).toEqual(original);
    });
});

describe('formatPostedDate', () => {
    it('formats an ISO date as a readable string', () => {
        expect(formatPostedDate('2027-01-05')).toBe('January 5, 2027');
    });

    it('returns the raw value when the date is unparseable', () => {
        expect(formatPostedDate('not-a-date')).toBe('not-a-date');
    });
});

/** Unit tests for the department and location filter helpers. */
describe('role filters', () => {
    /** Small fixture covering shared and unique departments and locations. */
    const jobs: Job[] = [
        { ...makeJob('a', '2027-01-01'), department: 'Finance', location: 'London' },
        { ...makeJob('b', '2027-01-02'), department: 'Finance', location: 'Dallas' },
        { ...makeJob('c', '2027-01-03'), department: 'Sales', location: 'London' },
        { ...makeJob('d', '2027-01-04'), department: 'Security', location: 'Mumbai' },
    ];
    /** Extract slugs so assertions stay readable. */
    const slugs = (list: Job[]): string[] => list.map((job) => job.slug);

    it('lists unique sorted departments and locations', () => {
        expect(getDepartments(jobs)).toEqual(['Finance', 'Sales', 'Security']);
        expect(getLocations(jobs)).toEqual(['Dallas', 'London', 'Mumbai']);
        expect(getDepartments([])).toEqual([]);
    });

    it('filters by department', () => {
        expect(slugs(filterJobs(jobs, { department: 'Finance', location: '' }))).toEqual(['a', 'b']);
    });

    it('filters by location', () => {
        expect(slugs(filterJobs(jobs, { department: '', location: 'London' }))).toEqual(['a', 'c']);
    });

    it('combines department and location with OR', () => {
        expect(slugs(filterJobs(jobs, { department: 'Security', location: 'London' }))).toEqual([
            'a',
            'c',
            'd',
        ]);
    });

    it('resets to the full list when both filters are empty', () => {
        const result = filterJobs(jobs, { department: '', location: '' });
        expect(result).toEqual(jobs);
        expect(result).not.toBe(jobs);
    });

    it('returns an empty list when nothing matches', () => {
        expect(filterJobs(jobs, { department: 'Nope', location: 'Nowhere' })).toEqual([]);
        expect(filterJobs([], { department: 'Finance', location: '' })).toEqual([]);
    });
});
