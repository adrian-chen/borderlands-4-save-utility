export interface ItemStats {
  primary_stat?: number;
  secondary_stat?: number;
  level?: number;
  rarity?: number;
  manufacturer?: number;
  item_class?: number;
  flags?: number[];
}

export interface DecodedItem {
  serial: string;
  item_type: string;
  item_category: string;
  length: number;
  stats: ItemStats;
  raw_fields: Record<string, number | number[] | [number, number][] | string>;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

export interface DecodedItemYaml {
  original_serial: string;
  item_type: string;
  category: string;
  confidence: string;
  stats: Record<string, number>;
}

export type YamlData = Record<string, unknown>;
