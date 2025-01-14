export interface ComfyWorkflow {
  prompt: string;
  workflow: {
    [key: string]: {
      inputs: {
        [key: string]: any;
      };
      class_type: string;
    };
  };
  useExisting?: boolean;
}

export interface ComfyGeneration {
  prompt: string;
  images: string[];
  prompt_id: string;
}

export interface ComfyResponse {
  success: boolean;
  error?: string;
  images?: string[];
  prompt_id?: string;
} 