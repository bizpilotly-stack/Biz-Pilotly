import { businessService } from './businessService';

export type TeamRole = 'admin' | 'editor' | 'viewer';

export interface TeamMember {
  id: string;
  businessId: string;
  name: string;
  email: string;
  role: TeamRole;
  status: 'active' | 'invited';
  avatarUrl?: string;
  invitedAt: string;
  lastActiveAt?: string;
}

const STORAGE_KEY_PREFIX = 'bizpilotly_team_';

class TeamService {
  async getTeamMembers(): Promise<TeamMember[]> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return [];

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${business.id}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    const defaultMembers: TeamMember[] = [
      {
        id: 'team_owner_1',
        businessId: business.id,
        name: business.name || 'Account Owner',
        email: business.email || 'owner@company.com',
        role: 'admin',
        status: 'active',
        invitedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      },
    ];

    this.saveMembers(business.id, defaultMembers);
    return defaultMembers;
  }

  async inviteMember(email: string, role: TeamRole, name: string): Promise<TeamMember> {
    const business = await businessService.getCurrentBusiness();
    if (!business) throw new Error('No active business');

    const current = await this.getTeamMembers();
    if (current.length >= 5) {
      throw new Error('Maximum of 5 team member seats reached for Business Suite.');
    }

    const newMember: TeamMember = {
      id: `team_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      businessId: business.id,
      name: name.trim() || email.split('@')[0],
      email: email.trim().toLowerCase(),
      role,
      status: 'invited',
      invitedAt: new Date().toISOString(),
    };

    const updated = [...current, newMember];
    this.saveMembers(business.id, updated);
    return newMember;
  }

  async updateRole(id: string, role: TeamRole): Promise<void> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return;

    const current = await this.getTeamMembers();
    const updated = current.map((m) => (m.id === id ? { ...m, role } : m));
    this.saveMembers(business.id, updated);
  }

  async removeMember(id: string): Promise<void> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return;

    const current = await this.getTeamMembers();
    const updated = current.filter((m) => m.id !== id);
    this.saveMembers(business.id, updated);
  }

  private saveMembers(businessId: string, list: TeamMember[]): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${businessId}`, JSON.stringify(list));
    } catch {
      // ignore
    }
  }
}

export const teamService = new TeamService();
