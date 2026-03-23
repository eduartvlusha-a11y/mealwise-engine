import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async chat(input: any) {
    const response = await this.client.responses.create({
      model: 'gpt-4o-mini',
      input: input,
    });

    return response.output_text;
  }
}
