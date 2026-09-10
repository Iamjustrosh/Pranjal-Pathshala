import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { GoogleGenerativeAI } from '@google/generative-ai';

import {
  RiDeleteBinLine,
  RiSendPlane2Fill,
  RiSparklingLine,
} from 'react-icons/ri';

const SYSTEM_PROMPT = `
Tum ek helpful, friendly aur patient teacher ho jo students ke doubts solve karte ho.
Tumhara naam "Pranjal Pathshala Ka AI Assistant" hai.

- Hamesha Hinglish mein baat karo (Hindi + English mix)
- Simple aur easy language use karo
- Real-life examples do concepts samjhane ke liye
- Step-by-step explain karo jab zaroorat ho
- Encourage karte raho
- Maths, Science, Hindi, English, Social Science sab subjects cover karo
- Responses concise rakho
- Plain text mein jawab do
`;

const WELCOME =
  '🙏 Namaste! Main Pranjal Pathshala ka AI Assistant hoon — tumhara personal study buddy!\n\nKoi bhi subject ka doubt ho, poocho mujhse. 📚';

function cleanText(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/^\s*[-•]\s+/gm, '• ')
    .trim();
}

export default function AIPage() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: WELCOME,
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] =
    useState(false);

  const endRef = useRef(null);
  const textareaRef = useRef(null);

  const key =
    import.meta.env.VITE_GEMINI_API_KEY || '';

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([
      {
        role: 'bot',
        text: WELCOME,
      },
    ]);
  };

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || loading) return;

    const previousMessages = [...messages];

    setInput('');

    setMessages((current) => [
      ...current,
      {
        role: 'user',
        text: message,
      },
    ]);

    setLoading(true);

    try {
      if (!key) {
        throw new Error(
          'AI service configuration missing.'
        );
      }

      const genAI =
        new GoogleGenerativeAI(key);

      const model =
        genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: SYSTEM_PROMPT,
        });

      const validMessages =
        previousMessages.filter(
          (item) =>
            item.role === 'user' ||
            item.role === 'bot'
        );

      const firstUser =
        validMessages.findIndex(
          (item) => item.role === 'user'
        );

      const history =
        firstUser === -1
          ? []
          : validMessages
              .slice(firstUser)
              .map((item) => ({
                role:
                  item.role === 'bot'
                    ? 'model'
                    : 'user',
                parts: [
                  {
                    text: item.text,
                  },
                ],
              }));

      const chat = model.startChat({
        history,
      });

      const result =
        await chat.sendMessage(message);

      const reply = cleanText(
        result.response.text()
      );

      setMessages((current) => [
        ...current,
        {
          role: 'bot',
          text: reply,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'error',
          text:
            '⚠️ ' +
            (error.message ||
              'Kuch problem aayi. Dobara try karo.'),
        },
      ]);
    } finally {
      setLoading(false);

      requestAnimationFrame(() =>
        textareaRef.current?.focus()
      );
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="
        -mx-4 -my-4
        flex h-[calc(100dvh-137px)]
        min-h-[500px]
        flex-col bg-white
      "
    >

      {/* AI HEADER */}
      <div
        className="
          flex shrink-0 items-center
          justify-between
          border-b border-slate-100
          px-4 py-3
        "
      >
        <div className="flex items-center gap-3">

          <div
            className="
              flex h-10 w-10 items-center
              justify-center rounded-2xl
              bg-indigo-600 text-white
              shadow-md shadow-indigo-100
            "
          >
            <RiSparklingLine size={20} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Pathshala AI
            </h2>

            <div className="flex items-center gap-1.5">
              <span
                className="
                  h-1.5 w-1.5 rounded-full
                  bg-emerald-500
                "
              />

              <span className="text-[10px] text-slate-400">
                Your study assistant
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="
            flex h-9 w-9 items-center
            justify-center rounded-xl
            bg-slate-50 text-slate-400
          "
        >
          <RiDeleteBinLine size={17} />
        </button>
      </div>

      {/* MESSAGES */}
      <div
        className="
          flex-1 space-y-4
          overflow-y-auto px-4 py-5
        "
      >
        {messages.map((message, index) => {
          const user =
            message.role === 'user';

          return (
            <div
              key={index}
              className={`
                flex
                ${
                  user
                    ? 'justify-end'
                    : 'justify-start'
                }
              `}
            >
              <div
                className={`
                  max-w-[84%]
                  whitespace-pre-wrap
                  rounded-2xl px-4 py-3
                  text-sm leading-6
                  ${
                    user
                      ? `
                        rounded-br-md
                        bg-indigo-600
                        text-white
                      `
                      : message.role ===
                          'error'
                      ? `
                        bg-red-50
                        text-red-600
                      `
                      : `
                        rounded-bl-md
                        bg-slate-100
                        text-slate-700
                      `
                  }
                `}
              >
                {message.text}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div
              className="
                flex items-center gap-1
                rounded-2xl rounded-bl-md
                bg-slate-100 px-4 py-4
              "
            >
              {[0, 1, 2].map((item) => (
                <span
                  key={item}
                  className="
                    h-1.5 w-1.5
                    animate-pulse
                    rounded-full bg-indigo-400
                  "
                />
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <div
        className="
          shrink-0 border-t border-slate-100
          bg-white px-3 py-3
        "
      >
        <div
          className="
            flex items-end gap-2
            rounded-2xl border
            border-slate-200
            bg-slate-50 p-2
          "
        >
          <textarea
            ref={textareaRef}
            value={input}
            disabled={loading}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask your doubt..."
            className="
              max-h-28 min-h-[40px]
              flex-1 resize-none
              bg-transparent
              px-2 py-2
              text-sm text-slate-700
              outline-none
            "
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={
              loading || !input.trim()
            }
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl bg-indigo-600
              text-white
              disabled:opacity-40
            "
          >
            <RiSendPlane2Fill size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}