export interface Skill {
  skill_id: number;
  name: string;
}

export interface GetSkillsResponse {
  code: string;
  description: string;
  data: Skill[];
}
