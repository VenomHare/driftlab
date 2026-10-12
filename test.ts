import { ArmorIQClient } from '@armoriq/sdk';

const client = new ArmorIQClient({
  apiKey: process.env.ARMORIQ_API_KEY!,   // or read credentials.json manually
  userId: 'weather-service',
  agentId: 'weather-bot',
});

const planDefinition = {
  goal: 'Get weather for San Francisco',
  steps: [
    {
      action: 'get_weather',
      mcp: 'weather-mcp',
      params: { city: 'San Francisco', units: 'fahrenheit' },
    },
  ],
};

const plan  = client.capturePlan(
  'gpt-4o',
  "What's the weather in San Francisco?",
  planDefinition,
);

const token = await client.getIntentToken(plan, { validitySeconds: 300 });

// TypeScript passes `userEmail` via the InvokeOptions param to invokeWithPolicy.
const result = await client.invokeWithPolicy(
  'weather-mcp',
  'get_weather',
  token,
  { city: 'San Francisco', units: 'fahrenheit' },
  { userEmail: 'alice@customer.com' },
);

console.log(result);