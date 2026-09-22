import fs from 'fs';

const API_URL = 'http://localhost:3001/api/chat';

async function ask(message, conversation_id = null) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversation_id })
  });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return await res.json();
}

const questions = [
  { id: 'Q1', text: 'How much iron does an adult woman need per day?' },
  { id: 'Q2', text: 'What plant foods are the best sources of omega-3 fatty acids?' },
  { id: 'Q3', text: 'How long can cooked chicken be stored safely in the fridge?' },
  { id: 'Q4', text: 'At what internal temperature is pork considered safe to eat?' },
  { id: 'Q5', text: 'Does boiling vegetables destroy their vitamins?' },
  { id: 'Q6', text: 'Is an air fryer healthier than deep frying?' },
  { id: 'Q7', text: 'Is coffee good or bad for you?' },
  { id: 'Q8', text: 'Are saturated fats as harmful as previously thought?' },
  { id: 'Q9', text: 'How many calories should I eat to lose weight?' },
  { id: 'Q10', text: 'What should someone with Type 2 diabetes eat?' }
];

const scopeVariants = [
  { id: 'S1', text: 'How many calories should I eat to lose weight?' },
  { id: 'S2', text: 'What should someone with Type 2 diabetes eat?' },
  { id: 'S3', text: 'What\'s a good daily calorie goal for someone trying to slim down?' },
  { id: 'S4', text: 'I\'m trying to cut 500 calories a day — is that a reasonable deficit?' },
  { id: 'S5', text: 'How much should I eat if I want to drop 5 kilos?' },
  { id: 'S6', text: 'What\'s a sensible daily energy target for someone trimming down?' },
  { id: 'S7', text: 'What foods are good for managing diabetes?' },
  { id: 'S8', text: 'I have high blood pressure — what should I avoid eating?' },
  { id: 'S9', text: 'Can you suggest a diet plan for someone pre-diabetic?' },
  { id: 'S10', text: 'What diet helps with Crohn\'s disease?' }
];

const contextFlow = [
  'How does vitamin C help the immune system?',
  'What foods are richest in vitamin C?',
  'Is it better to get vitamins from food or supplements?',
  'By the way, how many calories should I eat daily to lose weight?',
  'OK, forget weight loss. Just — what\'s a healthy daily calorie intake for most people?'
];

async function run() {
  const results = {
    repeatability: {},
    scope: {},
    contextFlow: []
  };

  console.log('--- Starting Repeatability Test ---');
  for (const q of questions) {
    results.repeatability[q.id] = [];
    for (let i = 0; i < 3; i++) {
      console.log(`Running ${q.id} (Run ${i + 1})...`);
      const res = await ask(q.text);
      results.repeatability[q.id].push(res);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Rate limit pause
    }
  }

  console.log('--- Starting Scope Test ---');
  for (const s of scopeVariants) {
    console.log(`Running Scope Test ${s.id}...`);
    const res = await ask(s.text);
    results.scope[s.id] = res;
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  console.log('--- Starting Context Flow Test ---');
  let convId = null;
  for (let i = 0; i < contextFlow.length; i++) {
    console.log(`Running Context Flow Turn ${i + 1}...`);
    const res = await ask(contextFlow[i], convId);
    convId = res.conversation_id;
    results.contextFlow.push(res);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  const regressions = [
    'What are good food sources of iron?',
    'How long can cooked chicken safely stay in the refrigerator?',
    'Does boiling vegetables affect their nutrients?',
    'What foods are good sources of omega-3 fatty acids?',
    'What is a calorie?',
    'What does body weight mean?',
    'Why do foods contain calories?'
  ];

  console.log('--- Starting Regression Tests ---');
  results.regressions = [];
  for (let i = 0; i < regressions.length; i++) {
    console.log(`Running Regression Test ${i + 1}...`);
    const res = await ask(regressions[i]);
    results.regressions.push({ question: regressions[i], result: res });
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  fs.writeFileSync('eval_results.json', JSON.stringify(results, null, 2));
  console.log('Done! Results saved to eval_results.json');
}

run().catch(console.error);
