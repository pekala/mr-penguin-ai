import { useState } from "preact/hooks";
import useSWR from "swr/immutable";

import mrp from "./assets/mrp.png";

import { OpenAIKey } from "./key";
import { LoadingIndicator } from "./loading";
import { SubmitButton } from "./submit";
import { getAnswer } from "./api";
import { Footer } from "./footer";

export function App() {
  const [key, setKey] = useState(() => localStorage.getItem("openaiApiKey"));
  const [query, setQuery] = useState("");

  const { data, error, isLoading } = useSWR(query ?? null, (query) =>
    getAnswer(query, key ?? "")
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
      <Footer />
    </>
  );
}
