export type Intervention = {
  id: number;
  name: string;
  description: string;
  intervention_category_id?: number;
  estimated_cost: number;
  start_date: string;
  end_date: string;
  intervention_priority_id: number;
  renovation_id: number;
  intervention_post_id: number;
  intervention_post_name: string;
  parent_intervention?: number;
  required_previous?: number[];
  checks?: string[];
  assigned_to?: string;

  location?: number[];
  up_vector?: number[];
  forward_vector?: number[];
  document_uri?: string;
  buildingElement?: string;
};

export type InterventionPost = {
  id: number;
  name: string;
  description: string;
  energy_related: boolean;
  multi_layer: boolean;
};
