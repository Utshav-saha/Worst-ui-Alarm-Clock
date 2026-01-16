import React, { useState, useEffect, useRef } from "react";

// --- DATA ---
const confessionList = [
  "Amar ghum dorkar nei.",
  "Ami daily right time e uthbo.",
  "Maf chai vai.",
  "I promise ar kokhono ei alarm set korbo na.",
];

const repeatText = "সময় একটি মায়া। ঘুম আমার জন্য নয়। ";

const agreementText = [
  "শর্তাবলী শুরু: ",
  "১. আমি সজ্ঞানে আমার ঘুমের বারোটা বাজানোর অনুমতি দিচ্ছি।",
  "২. আমি স্বীকার করছি যে স্নুজ বাটন শয়তানের আবিষ্কার।",
  ...Array(500).fill(repeatText),
  "সাবধান: উপরে যাওয়ার সম্ভাবনা আছে...",
  ...Array(300).fill("নেমে লাভ নেই। আবার উপরে যাবে। "),
  "অবশেষে: আপনি কি প্রস্তুত?",
  "স্বাক্ষর: আপনার অনুগত ভৃত্য।",
].join(" ");

const mathSolution = "40";
const mathImage = "/math_prob.png";
const codeSolution = "34";
const codeImage = "/code.png";

// --- ICONS ---
const WatchSvg = () => (
  <div className="flex justify-center items-center">
    <svg
      className="w-6 h-6 text-cyan-600 mr-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
  </div>
);

const UploadSvg = () => (
  <svg
    className="w-10 h-10 text-cyan-500 mb-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    ></path>
  </svg>
);

export default function AlarmApp() {
  // --- STATE ---
  const [currentStage, setCurrentStage] = useState(1);
  const [statusMessage, setStatusMessage] = useState("");
  const [loadProgress, setLoadProgress] = useState(0);
  const [failedUploads, setFailedUploads] = useState(0);

  const [glitchTime, setGlitchTime] = useState("");
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isAfternoon, setIsAfternoon] = useState(false);
  const [periodPosition, setPeriodPosition] = useState({ x: 0, y: 0 });
  const [isSliding, setIsSliding] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [challengeLevel, setChallengeLevel] = useState(0);

  const [sentenceToType, setSentenceToType] = useState("");
  const [inputSentence, setInputSentence] = useState("");
  const [secretCode, setSecretCode] = useState(null);
  const [inputPin, setInputPin] = useState("");
  const [inputMath, setInputMath] = useState("");
  const [inputCode, setInputCode] = useState("");

  // Track mistakes
  const [mistakesMade, setMistakesMade] = useState(0); 
  const [mathMistakes, setMathMistakes] = useState(0); 
  const [codeMistakes, setCodeMistakes] = useState(0); 

  const [buttonCoords, setButtonCoords] = useState([
    { top: "50%", left: "50%" },
    { top: "60%", left: "50%" },
    { top: "70%", left: "50%" },
  ]);

  const moveTimer = useRef(null);
  const alarmSound = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      alarmSound.current = new Audio("/alarm.mp3");
      alarmSound.current.loop = true;
    }
  }, []);

  // --- PHASE 1: UPLOAD ---
  const onFileChange = (e) => {
    setStatusMessage("ঘড়ির ছবি যাচাই করা হচ্ছে...");
    setLoadProgress(10);
    const interval = setInterval(() => {
      setLoadProgress((prev) => Math.min(prev + Math.random() * 20, 90));
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setLoadProgress(100);

      if (failedUploads < 2) {
        const errorMessages = [
          "ছবিটি অস্পষ্ট। আবার চেষ্টা করুন।",
          "ঘড়ির ছবি সঠিক কোণ থেকে নিন।",
        ];
        alert(errorMessages[failedUploads % 2]);
        setStatusMessage("");
        setLoadProgress(0);
        setFailedUploads((prev) => prev + 1);
        e.target.value = null;
      } else {
        setStatusMessage("ঘড়ি থেকে টাইম এক্সট্রাক্ট করা হচ্ছে...");
        setTimeout(() => {
          setGlitchTime(
            `${Math.floor(Math.random() * 12) + 1}:${Math.floor(
              Math.random() * 60,
            )
              .toString()
              .padStart(2, "0")} ${Math.random() > 0.5 ? "AM" : "PM"}`,
          );
          setCurrentStage(1.5);
        }, 1500);
      }
    }, 2000);
  };

  // --- PHASE 2: EVIL SLIDERS ---
  const adjustTime = (e, type) => {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const changeAmount = Math.floor(Math.random() * 3) + 1;

    if (type === "hour") {
      let newVal = selectedHour + direction * changeAmount;
      if (newVal > 12) newVal = 1;
      if (newVal < 1) newVal = 12;
      setSelectedHour(newVal);
    } else {
      let newVal = selectedMinute + direction * changeAmount;
      if (newVal > 59) newVal = 0;
      if (newVal < 0) newVal = 59;
      setSelectedMinute(newVal);
    }
  };

  const triggerDrift = (type) => {
    setIsSliding(true);
    let driftCount = 0;
    const maxDrifts = 10;

    const driftInterval = setInterval(() => {
      driftCount++;
      const driftDir = Math.random() > 0.5 ? 1 : -1;

      if (type === "hour") {
        setSelectedHour((prev) => {
          let n = prev + driftDir;
          return n > 12 ? 1 : n < 1 ? 12 : n;
        });
      } else {
        setSelectedMinute((prev) => {
          let n = prev + driftDir;
          return n > 59 ? 0 : n < 0 ? 59 : n;
        });
      }

      if (driftCount >= maxDrifts) {
        clearInterval(driftInterval);
        setIsSliding(false);
      }
    }, 100);
  };

  const shiftPeriodButton = () => {
    setPeriodPosition({
      x: Math.random() * 150 - 75,
      y: Math.random() * 80 - 40,
    });
  };

  const togglePeriod = () => setIsAfternoon(!isAfternoon);

  const showTerms = () => {
    setIsModalOpen(true);
    setIsTermsAccepted(false);
  };

  const checkScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (Math.random() > 0.98) e.target.scrollTop = 0;
    if (scrollTop > scrollHeight * 0.8 && Math.random() > 0.92) {
      e.target.scrollTo({ top: scrollTop - 800, behavior: "smooth" });
    }
    if (Math.abs(scrollHeight - scrollTop - clientHeight) < 10)
      setIsTermsAccepted(true);
  };

  const confirmTerms = () => {
    setIsModalOpen(false);
    alert(`Alarm saved.`);
    scatterButtons();
    setTimeout(() => {
      setIsAlarmRinging(true);
      setCurrentStage(3);
      if (alarmSound.current)
        alarmSound.current.play().catch((e) => console.error(e));
    }, 3000);
  };

  // --- PHASE 3: RUNAWAY BUTTONS ---
  const scatterButtons = () => {
    const newCoords = [0, 1, 2].map(() => ({
      top: Math.max(10, Math.random() * 80) + "%",
      left: Math.max(10, Math.random() * 80) + "%",
    }));
    setButtonCoords(newCoords);
  };

  const dodgeCursor = (index) => {
    moveTimer.current = setTimeout(() => {
      const currentCoords = [...buttonCoords];
      currentCoords[index] = {
        top: Math.max(10, Math.random() * 80) + "%",
        left: Math.max(10, Math.random() * 80) + "%",
      };
      setButtonCoords(currentCoords);
    }, 100);
  };

  const cancelDodge = () => {
    if (moveTimer.current) clearTimeout(moveTimer.current);
  };

  const handleActionClick = (actionType) => {
    if (moveTimer.current) clearTimeout(moveTimer.current);

    if (actionType === "stop") {
      const generatedCode = Math.floor(10000 + Math.random() * 90000);
      setSecretCode(generatedCode);
      console.log(
        `%c Your code is: ${generatedCode}`,
        "background: #22d3ee; color: #0e7490; font-size: 20px; font-weight: bold;",
      );
      setChallengeLevel(1);
    } else {
      alert("Snooze broken. Volume up.");
      if (alarmSound.current) alarmSound.current.playbackRate += 0.1;
      scatterButtons();
    }
  };

  // --- AUTH LOGIC ---
  const checkPin = () => {
    if (parseInt(inputPin) === secretCode) {
      setSentenceToType(
        confessionList[Math.floor(Math.random() * confessionList.length)],
      );
      setChallengeLevel(2);
    } else {
      alert("ভুল কোড। আবার কল দাও or check console");
      setInputPin("");
    }
  };

  const checkSentence = () => {
    if (inputSentence === sentenceToType) {
      if (mistakesMade === 0) {
        setMistakesMade((prev) => prev + 1);
        setInputSentence("");
        alert("খুব দ্রুত টাইপ করেছেন। রোবট সন্দেহ করা হচ্ছে। আবার লিখুন।");
        setSentenceToType((prev) => prev + " Maf chai vai.");
        return;
      }

      setChallengeLevel(3);
    } else {
      setMistakesMade((prev) => prev + 1);
      setInputSentence("");
      alert(`বলসিলাম ভুল করা যাবেনা `);
      setSentenceToType((prev) => prev + " Maf chai vai.");
    }
  };

  const checkMath = () => {
    if (inputMath === mathSolution) {
      alert("অরেহ সিজি ৪. Next...");
      setChallengeLevel(4);
    } else {
      const newMistakes = mathMistakes + 1;
      setMathMistakes(newMistakes);

      if (newMistakes >= 3) {
        alert("বেশি প্যারা নিও না। Check Console.");
        console.log(
          `%c Math Answer: ${mathSolution}`,
          "background: #22d3ee; color: #0e7490; font-size: 20px; font-weight: bold;",
        );
      } else {
        alert("হায়রে নুব ");
      }
      setInputMath("");
    }
  };

  const checkCode = () => {
    if (inputCode.toLowerCase() === codeSolution) {
      if (alarmSound.current) alarmSound.current.pause();
      alert("You are free.");
      window.location.reload();
    } else {
      const newMistakes = codeMistakes + 1;
      setCodeMistakes(newMistakes);

      if (newMistakes >= 3) {
        alert("অনলাইন ও পারেনা? Check Console.");
        console.log(
          `%c Code Answer: ${codeSolution}`,
          "background: #22d3ee; color: #0e7490; font-size: 20px; font-weight: bold;",
        );
      } else {
        alert("অনলাইন ও পারেনা ");
      }
      setInputCode("");
    }
  };

  return (
    <div
      className={`min-h-screen font-sans text-cyan-800 flex flex-col items-center justify-center p-6 selection:bg-cyan-100 relative overflow-hidden transition-colors duration-100 ${isAlarmRinging ? "animate-siren" : "bg-cyan-300"}`}
    >
      <style>{`
        @keyframes siren { 0%, 100% { background: #67e8f9; } 50% { background: #22d3ee; } }
        .animate-siren { animation: siren 0.4s infinite steps(2, end); }
        input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 24px; width: 24px; border-radius: 50%; background: #ffffff; cursor: pointer; margin-top: -8px; border: 2px solid #22d3ee; }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 8px; cursor: pointer; background: #cffafe; border-radius: 5px; }
      `}</style>

      {/* HEADER */}
      {!isAlarmRinging && (
        <div className="mb-8 text-center animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-200 shadow-lg mb-6 text-cyan-600">
            <WatchSvg />
          </div>
          <h1 className="text-4xl font-extrabold text-cyan-900 tracking-tight">
            একটি ভালো <span className="text-cyan-600">অ্যালার্ম</span>
          </h1>
        </div>
      )}

      {/* PHASE 1: UPLOAD */}
      {currentStage === 1 && (
        <div className="bg-cyan-200 rounded-2xl shadow-xl w-full max-w-md p-8 border border-cyan-100 z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-cyan-800">
              Ai Time detector
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-cyan-100 text-cyan-600 rounded-full">
              Attempt {failedUploads + 1}
            </span>
          </div>
          <label className="block w-full cursor-pointer group">
            <div className="border-2 border-dashed border-cyan-100 rounded-xl p-10 flex flex-col items-center justify-center transition-colors group-hover:border-cyan-400 group-hover:bg-cyan-100/50">
              <UploadSvg />
              <p className="text-sm font-medium text-cyan-700">
                ঘড়ির ছবি আপলোড করুন
              </p>
              <input type="file" onChange={onFileChange} className="hidden" />
            </div>
          </label>
          {statusMessage && (
            <div className="mt-4 text-xs font-bold text-cyan-700">
              {statusMessage} {Math.round(loadProgress)}%
            </div>
          )}
        </div>
      )}

      {/* PHASE 1.5: WRONG TIME */}
      {currentStage === 1.5 && (
        <div className="bg-cyan-200 rounded-2xl shadow-xl w-full max-w-md p-8 border border-cyan-100 text-center z-10">
          <h2 className="text-2xl font-bold mb-2 text-cyan-800">
            এইত্ত পেয়ে গেছি!
          </h2>
          <div className="text-4xl font-black text-cyan-600 mb-8 font-mono">
            {glitchTime}
          </div>
          <button
            onClick={() => setCurrentStage(2)}
            className="text-sm underline cursor-pointer text-cyan-500 hover:text-cyan-700"
          >
            (Edit)
          </button>
        </div>
      )}

      {/* PHASE 2: EVIL SLIDERS */}
      {currentStage === 2 && (
        <div className="bg-cyan-200 rounded-2xl shadow-xl w-full max-w-lg p-8 border border-cyan-100 z-10 relative">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-cyan-800">Fine Tune</h2>
            <p className="text-sm text-cyan-500">
              {isSliding ? "টাইম ঠিক করা হচ্ছে " : "পারলে ঠিক করে দেখাও"}
            </p>
          </div>

          <div className="space-y-8 mb-8">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-cyan-700">Hour</label>
                <span className="text-xl font-mono font-bold text-cyan-900">
                  {selectedHour}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={selectedHour}
                onChange={(e) => adjustTime(e, "hour")}
                onMouseUp={() => triggerDrift("hour")}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-cyan-700">
                  Minute
                </label>
                <span className="text-xl font-mono font-bold text-cyan-900">
                  {selectedMinute.toString().padStart(2, "0")}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={selectedMinute}
                onChange={(e) => adjustTime(e, "min")}
                onMouseUp={() => triggerDrift("min")}
              />
            </div>

            <div className="h-16 relative border border-cyan-100 rounded-lg bg-cyan-100 overflow-hidden">
              <p className="text-xs text-center text-cyan-500 mt-1">
                Select Period:
              </p>
              <button
                onMouseEnter={shiftPeriodButton}
                onClick={togglePeriod}
                style={{
                  transform: `translate(${periodPosition.x}px, ${periodPosition.y}px)`,
                  transition: "transform 0.1s",
                }}
                className="absolute top-1/2 left-1/2 -ml-6 -mt-3 w-12 px-2 py-1 bg-white text-cyan-600 text-xs font-bold rounded shadow-lg z-10"
              >
                {isAfternoon ? "PM" : "AM"}
              </button>
            </div>
          </div>

          <button
            onClick={showTerms}
            className="w-full bg-white text-cyan-600 font-bold py-3 rounded-xl hover:bg-cyan-50"
          >
            Save
          </button>

          {isModalOpen && (
            <div className="fixed inset-0 bg-cyan-500/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-cyan-100 rounded-2xl shadow-2xl w-full max-w-md h-[500px] flex flex-col overflow-hidden font-['Hind_Siliguri']">
                <div className="p-4 border-b border-cyan-200 font-bold text-cyan-800">
                  Terms of Suffering
                </div>
                <div
                  onScroll={checkScroll}
                  className="flex-1 overflow-y-auto p-6 text-sm text-cyan-600"
                >
                  {agreementText}
                </div>
                <div className="p-4 border-t border-cyan-200">
                  <button
                    disabled={!isTermsAccepted}
                    onClick={confirmTerms}
                    className={`w-full py-3 rounded-lg font-bold ${isTermsAccepted ? "bg-cyan-500 text-white" : "bg-cyan-200 text-cyan-400"}`}
                  >
                    {isTermsAccepted
                      ? "সব শর্ত মেনে নিলাম "
                      : "নিচে যেতে থাক... "}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 3: ALARM */}
      {currentStage === 3 && (
        <div className="fixed inset-0 z-50 w-full h-full">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h1 className="text-9xl font-black text-cyan-100 drop-shadow-lg animate-pulse">{`${selectedHour}:${selectedMinute.toString().padStart(2, "0")}`}</h1>
          </div>

          {challengeLevel === 0 && (
            <>
              {["volume++", "snooze", "silence"].map((actionType, idx) => (
                <button
                  key={actionType}
                  onMouseEnter={() => dodgeCursor(idx)}
                  onMouseLeave={cancelDodge}
                  onClick={() => handleActionClick(actionType)}
                  style={{
                    position: "absolute",
                    top: buttonCoords[idx].top,
                    left: buttonCoords[idx].left,
                    transition: "all 0.3s ease-out",
                  }}
                  className="bg-cyan-100 text-cyan-800 px-8 py-4 rounded-full font-black text-xl border-4 border-white uppercase z-50 cursor-pointer"
                >
                  {actionType}
                </button>
              ))}
            </>
          )}

          {challengeLevel > 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-cyan-200 border-4 border-white rounded-2xl p-8 shadow-2xl w-full max-w-lg">
                {challengeLevel === 1 && (
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-black text-cyan-800">
                      পিন দাও{" "}
                    </h2>
                    <p className="text-cyan-700">
                      Call <span className="text-cyan-500">01234567899</span>{" "}
                      
                    </p>
                    <input
                      type="text"
                      value={inputPin}
                      onChange={(e) => setInputPin(e.target.value)}
                      placeholder="PIN"
                      className="w-full text-center text-3xl border-2 border-cyan-300 bg-cyan-100 text-cyan-800 p-2 placeholder-cyan-400"
                      maxLength={5}
                    />
                    <button
                      onClick={checkPin}
                      className="w-full bg-white text-cyan-700 font-bold py-3"
                    >
                      VERIFY
                    </button>
                  </div>
                )}

                {challengeLevel === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-black text-cyan-800 text-center">
                      ভুল করলেই শেষ
                    </h2>
                    <div className="bg-cyan-100 p-2 blur-[1px] select-none text-center font-bold text-cyan-600">
                      "{sentenceToType}"
                    </div>
                    <textarea
                      value={inputSentence}
                      onChange={(e) => setInputSentence(e.target.value)}
                      onPaste={(e) => e.preventDefault()}
                      className="w-full text-center p-2 border-2 border-cyan-300 bg-cyan-100 text-cyan-800 placeholder-cyan-400"
                      placeholder="Type..."
                    />
                    <button
                      onClick={checkSentence}
                      className="w-full bg-white text-cyan-700 font-bold py-3"
                    >
                      SUBMIT
                    </button>
                  </div>
                )}

                {challengeLevel === 3 && (
                  <div className="space-y-4 text-center">
                    <h2 className="text-2xl font-black text-cyan-800">
                      চল একটা ছোট সিটি হয়ে যাক{" "}
                    </h2>
                    <img
                      src={mathImage}
                      alt="Math"
                      className="w-full border-4 border-white"
                    />
                    <input
                      type="text"
                      value={inputMath}
                      onChange={(e) => setInputMath(e.target.value)}
                      placeholder="Answer"
                      className="w-full text-center text-2xl border-2 border-cyan-300 p-2 bg-cyan-100 text-cyan-800 placeholder-cyan-400"
                    />
                    <button
                      onClick={checkMath}
                      className="w-full bg-white text-cyan-700 font-bold py-3"
                    >
                      NEXT
                    </button>
                  </div>
                )}

                {challengeLevel === 4 && (
                  <div className="space-y-4 text-center">
                    <h2 className="text-2xl font-black text-cyan-800">
                      এবার একটা অনলাইন
                    </h2>
                    <img
                      src={codeImage}
                      alt="Code"
                      className="w-full border-4 border-white bg-cyan-100"
                    />
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Result"
                      className="w-full text-center text-2xl border-2 border-cyan-300 p-2 bg-cyan-100 text-cyan-800 placeholder-cyan-400"
                    />
                    <button
                      onClick={checkCode}
                      className="w-full bg-white text-cyan-700 font-bold py-3"
                    >
                      FINISH
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
