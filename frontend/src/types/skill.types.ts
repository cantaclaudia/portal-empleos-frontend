export interface Skill {
  skill_id: number;
  skill_name: string;
}

export interface GetSkillsResponse {
  code: string;
  description: string;
  data: Skill[];
}
