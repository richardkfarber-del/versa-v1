import { VERSA_QUIZ } from './content.js';

/**
 * Epic 8: Content Discovery & Filtering
 * Manages the logic for sorting activities by user capacity.
 */
export class VersaDiscovery {
    /**
     * Filters the quiz/activity library based on mood tags.
     * @param {Object} filters - { energy_level: 'low'|'medium'|'high', focus: string }
     * @returns {Array} - Filtered subset of VERSA_QUIZ
     */
    static filterActivities(filters) {
        return VERSA_QUIZ.filter(item => {
            let match = true;
            if (filters.energy_level && item.energy_level !== filters.energy_level) {
                match = false;
            }
            if (filters.focus && item.focus !== filters.focus) {
                match = false;
            }
            return match;
        });
    }

    /**
     * Helper to get unique energy levels present in the catalog.
     */
    static getAvailableEnergyLevels() {
        return [...new Set(VERSA_QUIZ.map(item => item.energy_level))];
    }
}
