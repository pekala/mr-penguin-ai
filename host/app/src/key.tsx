import { useState } from "preact/hooks";
import { SubmitButton } from "./submit";

export const OpenAIKey = ({ onSave }: { onSave: (key: string) => void }) => {
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    localStorage.setItem("openaiApiKey", apiKey);
    onSave(apiKey);
  };

  return (
    <div className={`w-full`}>
      <form
        className="bg-white p-10 rounded-lg shadow-xl"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-5">Enter your OpenAI API Key</h2>
        <div class="flex mb-5 items-center">
          <input
            placeholder="OpenAI API Key"
            type="password"
            className="text-xl font-bold w-full p-4 -translate-x-4"
            value={apiKey}
            autoFocus
            onChange={(e: any) => setApiKey(e.target?.value)}
          />
          <SubmitButton />
        </div>
        <div class="text-sm">
          Get your key{" "}
          <a
            class="text-blue-600"
            href="https://platform.openai.com/account/api-keys"
          >
            from OpenAI
          </a>
          . Note, your key will get saved in LocalStorage and sent directly to
          OpenAI. Pinky promise!
        </div>
      </form>
    </div>
  );
};
