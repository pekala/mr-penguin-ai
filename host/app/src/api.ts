export async function getAnswer(query: string, key: string) {
  const embedding = await createEmbedding(query, key);
  const queryEmbedding = encodeEmbedding(embedding);
  const polymathResults = await askPolymath(queryEmbedding);
  const context = createPrompt(query, polymathResults);
  const completionResult = await getCompletion(context, key);
  return {
    bits: polymathResults.bits.map((entry: any) => entry.info),
    answer: completionResult,
  };
}

async function askPolymath(embedding: string) {
  const form = new FormData();
  form.append("version", "1");
  form.append("query_embedding_model", "openai.com:text-embedding-ada-002");
  form.append("sort", "similarity");
  form.append("query_embedding", embedding);

  const result = await fetch("/", {
    method: "POST",
    body: form,
  });
  return await result.json();
}

function encodeEmbedding(data: any) {
  return btoa(
    String.fromCharCode(...new Uint8Array(new Float32Array(data).buffer))
  );
}

function createPrompt(query: string, results: any) {
  const context = results.bits.map((chunk: any) => chunk.text).join("\n");
  return `Answer the question as truthfully as possible using the provided context, and if don't have the answer, say in a friendly tone that Mr. Penguin does not know the answer and suggest looking for this information elsewhere.\n\nContext:\n${context} \n\nQuestion:\n${query}\n\nAnswer:`;
}

async function createEmbedding(query: string, key: string) {
  const embeddingResponse = await callOpenAI(
    "embeddings",
    {
      input: query,
      model: "text-embedding-ada-002",
    },
    key
  );

  return embeddingResponse.data[0].embedding;
}

async function getCompletion(prompt: string, key: string) {
  const response = await callOpenAI(
    "completions",
    {
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 1024,
      temperature: 0,
      top_p: 1,
      n: 1,
      stream: false,
      logprobs: null,
      stop: "\n",
    },
    key
  );
  return response.choices[0].text;
}

async function callOpenAI(type: string, payload: any, key: string) {
  const url = `https://api.openai.com/v1/${type}`;
  const result = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await result.json();
  if (json.error) {
    throw new Error(json.error.message);
  }
  return json;
}
