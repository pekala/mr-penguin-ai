import { useState } from "preact/hooks";
import mrp from "./assets/mrp.png";
import { OpenAIKey } from "./key";
import { LoadingIndicator } from "./loading";
import { SubmitButton } from "./submit";
import useSWR from "swr/immutable";

export function App() {
  const [key, setKey] = useState(() => localStorage.getItem("openaiApiKey"));
  const [query, setQuery] = useState("");

  const { data, error, isLoading } = useSWR(query ?? null, (query) =>
    askOpenAI(query, key ?? "")
  );

  const clearKey = () => {
    localStorage.removeItem("openaiApiKey");
    setKey(null);
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const q = e.target?.elements?.query.value;
    if (!key || !q) {
      return;
    }
    setQuery(q);
  };

  return (
    <>
      <div class="grid md:grid-cols-2 gap-10 p-10 mx-auto">
        <div class="bg-slate-100 p-6">
          <h1 className="text-5xl font-bold mb-5 leading-tight">
            Ask Mr. Penguin <br />
            About Pleo
          </h1>
          {key && (
            <form
              class="flex mb-5 items-center"
              disabled={!key}
              onSubmit={onSubmit}
            >
              <input
                placeholder="Type anything..."
                autoFocus
                type="text"
                name="query"
                className="text-xl font-bold w-full p-4 -translate-x-4 bg-transparent border-b-2 border-grey-100"
                disabled={!key}
              ></input>
              <SubmitButton isDisabled={!key} />
            </form>
          )}
          <img src={mrp} class="object-contain h-80 w-80 m-auto" />
          {key && (
            <button
              class="text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg px-3 py-2 text-xs text-center mr-2 mb-2"
              onClick={clearKey}
            >
              Reset OpenAI Key
            </button>
          )}
        </div>
        <div class="bg-slate-300 p-6 flex items-center justify-center">
          {isLoading && <LoadingIndicator />}
          {!key && <OpenAIKey onSave={setKey} />}
          {key && !isLoading && !data && !error && (
            <div>
              Mr. Penguin has read all the{" "}
              <a class="text-blue-600" href="http://help.pleo.io">
                Pleo help center articles
              </a>{" "}
              many times over. He can answer most questions about the Pleo
              product. He's just an intern though, so there is no guarantee the
              answer will be correct, go easy on him. He will talk like a pirate
              if you ask nicely.
            </div>
          )}
          {!isLoading && key && (
            <div>
              {query && (
                <div class="text-gray-600 mb-5 text-base">"{query}"</div>
              )}
              {data && <div class="text-gray-900 text-lg">{data.answer}</div>}
              {data && (
                <div class="mt-5">
                  <div class="text-gray-600 mb-2 text-base">Read more</div>
                  <ul class="list-disc ml-2">
                    {data.bits.map((bit: any) => (
                      <li
                        key={bit.title}
                        class="text-base font-bold text-blue-600"
                      >
                        <a href={bit.url}>{bit.title}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {error && (
                <div class="mt-5">
                  <div class="text-red-700 mb-2 text-base">Error! :(</div>
                  <div class="text-gray-800 text-small">{error.toString()}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div class="text-center">
        Built by{" "}
        <a class="text-blue-600" href="https://peka.la">
          Maciek
        </a>{" "}
        using{" "}
        <a class="text-blue-600" href="https://github.com/dglazkov/polymath">
          Polymath
        </a>
        . Mr Penguin drawn by the amazing{" "}
        <a href="https://pleo.design/">Pleo Brand</a> team.
      </div>
    </>
  );
}

async function askOpenAI(query: string, key: string) {
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
