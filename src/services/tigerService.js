import { TIGER_PROFILES } from '../data/demoData';

export const tigerService = {
  async getTigers() {
    // Returns the static list of tigers tracked by the reserve
    return TIGER_PROFILES;
  }
};
