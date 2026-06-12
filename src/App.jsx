import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, HelpCircle, BarChart3, Settings, LogIn, ChevronRight, ChevronLeft, 
  Play, RotateCcw, AlertTriangle, Plus, Trash2, Edit2, Volume2, VolumeX,
  Award, CheckCircle, X, RefreshCw, Send, Sparkles, Smile, Star, Coffee,
  Download, FileSpreadsheet
} from 'lucide-react';

// === SUPABASE 설정 ===
// Vercel 환경변수를 사용하거나, 아래에 직접 값을 입력하세요
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === CONSTANTS & QUESTION BANK ===
const ADMIN_PASSWORD = "Rnao!234";

// 만족도 10문항 (최신 조직문화 평가 5점 리커트 척도)
const SATISFACTION_QUESTIONS = [
  { id: 1, category: "소통", text: "우리 부서는 상하간/동료간 자유롭게 의견을 제안하고 경청하는 분위기이다." },
  { id: 2, category: "업무", text: "나에게 주어진 업무 역할과 책임(R&R)이 명확하고 합리적으로 배분되어 있다." },
  { id: 3, category: "성장", text: "현재 수행하는 업무를 통해 개인의 직무 역량이 지속적으로 성장하고 있다고 느낀다." },
  { id: 4, category: "자율", text: "스스로 업무 계획을 수립하고, 진행 방식을 결정할 수 있는 자율성이 보장된다." },
  { id: 5, category: "효율", text: "불필요한 보고, 중복 회의 등 비효율적인 행정 업무가 최소화되어 있다." },
  { id: 6, category: "문화", text: "야근을 강요하지 않으며, 연차나 유연근무를 눈치 보지 않고 자유롭게 사용한다." },
  { id: 7, category: "소통", text: "타 부서와의 업무 협조 및 정보 공유가 막힘없이 원활하게 이루어진다." },
  { id: 8, category: "업무", text: "성공과 실패에 대해 서로 격려하고, 합리적인 수준의 업무 피드백이 제공된다." },
  { id: 9, category: "성장", text: "회사와 부서는 임직원의 커리어 발전을 지원하기 위한 충분한 관심을 가지고 있다." },
  { id: 10, category: "자율", text: "형식적인 절차보다 실제 성과와 실질적 문제 해결에 집중하여 일한다." }
];

// 조직문화 밸런스 게임 18문항 (6개 차원 × 3문항, 최적화 압축 버전)
const BALANCE_QUESTIONS = [
  // ── 소통 차원 (3문항) ──────────────────────────────────────────────
  { id: 1,  category: "소통", text: "이상적인 리더의 의사소통 스타일은?",
    optionA: "명확한 탑다운 지시형", optionB: "쌍방향 합의 도출형" },
  { id: 2,  category: "소통", text: "피드백을 들을 때 더 편안한 스타일은?",
    optionA: "핵심만 직설적으로 말해주는 팩트 폭격 피드백", optionB: "감정을 배려하며 부드럽게 돌려 말해주는 완곡 피드백" },
  { id: 3,  category: "소통", text: "후배 사원이 업무 실수를 했을 때 나의 태도는?",
    optionA: "즉시 지적하고 올바른 대안을 강력하게 훈수", optionB: "실수의 원인을 스스로 찾아내도록 질문하며 대기" },

  // ── 업무 차원 (3문항) ──────────────────────────────────────────────
  { id: 4,  category: "업무", text: "피하고 싶은 동료 유형은?",
    optionA: "일은 잘하지만 까칠하고 이기적인 동료", optionB: "착하고 협조적이나 일머리가 부족한 동료" },
  { id: 5,  category: "업무", text: "업무 배정 시 더 선호하는 균형은?",
    optionA: "나의 기존 전문 영역 내에서만 안전하게 일하기", optionB: "새롭고 도전적인 미션을 도맡아 존재감 키우기" },
  { id: 6,  category: "업무", text: "일이 몰릴 때 마인드셋은?",
    optionA: "조금 무리해서라도 오늘 내로 끝내야 속이 시원함", optionB: "시간이 지나면 과부하가 걸리니 정시 퇴근 후 내일 처리" },

  // ── 성장 차원 (3문항) ──────────────────────────────────────────────
  { id: 7,  category: "성장", text: "성장을 위한 더 가치 있는 기회는?",
    optionA: "높은 연봉 상승을 동반한 격무 부서", optionB: "워라밸이 완벽히 보장되는 무난한 부서" },
  { id: 8,  category: "성장", text: "평가 및 보상 체계 중 더 공정하다고 느끼는 것은?",
    optionA: "성과에 따른 확실한 차등 보상(개인주의적 경쟁)", optionB: "기본 기여도를 인정하는 안정 지향형 분배(팀워크)" },
  { id: 9,  category: "성장", text: "사내 공모나 보직 순환에 대한 나의 생각은?",
    optionA: "한 분야에서 롱런하여 독보적 스페셜리스트 되기", optionB: "다양한 부서를 거치며 폭넓은 제너럴리스트 되기" },

  // ── 자율 차원 (3문항) ──────────────────────────────────────────────
  { id: 10, category: "자율", text: "일의 시작과 끝을 관리하는 방식 중 선호하는 것은?",
    optionA: "정형화된 보고 라인과 촘촘한 가이드라인", optionB: "목표 설정 후 세부 실행 과정은 전적으로 자율" },
  { id: 11, category: "자율", text: "유연근무제 이용 시 가장 중시해야 할 점은?",
    optionA: "팀 간 협업 시간(Core-Time)의 엄격한 준수", optionB: "개인 라이프사이클에 맞춘 자율적인 시간 배치" },
  { id: 12, category: "자율", text: "팀 공동 목표와 나의 개인 목표가 다소 충돌할 때?",
    optionA: "팀의 미션 달성을 위해 개인 의견을 양보하고 헌신", optionB: "나의 성향 및 방향성에 맞지 않음을 적극적으로 설득" },

  // ── 효율 차원 (3문항) ──────────────────────────────────────────────
  { id: 13, category: "효율", text: "부서 회의 진행 방식으로 더 나은 것은?",
    optionA: "모두가 의견을 한마디씩 내는 난상토론(30분)", optionB: "리더가 핵심 사항을 결정해 속전속결 전달(10분)" },
  { id: 14, category: "효율", text: "협력사 계약 협상 시 중요시하는 기조는?",
    optionA: "엄격한 법률 및 구매 규정 준수를 최우선으로 검토", optionB: "상황에 따라 유연하게 윈윈 방안을 도출하는 융통성" },
  { id: 15, category: "효율", text: "결재선 지정 시 프로세스 효율성은?",
    optionA: "위험 방지를 위해 다수의 관련 부서를 검토선에 지정", optionB: "속도전을 위해 결재선을 단 한 두 단계로 대폭 축소" },

  // ── 문화 차원 (3문항) ──────────────────────────────────────────────
  { id: 16, category: "문화", text: "워크샵 프로그램으로 더 선호하는 것은?",
    optionA: "친밀도 형성을 위한 액티비티 및 친목 회식", optionB: "업무 인사이트 위주의 가벼운 세미나 후 빠른 퇴근" },
  { id: 17, category: "문화", text: "우리 계약실의 경조사 및 사내 행사 챙기기 수준은?",
    optionA: "무조건 전원 참석하여 끈끈하게 챙기는 가족형", optionB: "각자 부담 없는 선에서 자유롭게 축하하는 실속형" },
  { id: 18, category: "문화", text: "주말이나 퇴근 후 부서원의 연락?",
    optionA: "중요한 공적인 사안이면 예의 바르게 즉각 대응", optionB: "내일 아침 출근 시 확인하는 것이 원칙 (읽씹 후 아침 대응)" },
];

// 초기 퀴즈 데이터 세트
const INITIAL_QUIZZES = [];

// 오디오 재생 헬퍼
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'tick') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); 
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); 
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'fail') {
      osc.frequency.setValueAtTime(220, ctx.currentTime); 
      osc.frequency.setValueAtTime(147, ctx.currentTime + 0.15); 
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'drumroll') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      for (let i = 0; i < 10; i++) {
        osc.frequency.setValueAtTime(90 + Math.random() * 30, ctx.currentTime + i * 0.05);
      }
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    console.log("Audio contexts pending interaction or not supported in environment", e);
  }
};

// ===== 사다리 게임 서브컴포넌트 =====
function LadderGame({ participants, isDrawing, onWinner }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const ladderDataRef = useRef(null); // { cols, rungs, paths }

  const COLORS = [
    '#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6',
    '#ec4899','#14b8a6','#f97316','#6366f1','#22c55e',
  ];

  // 사다리 구조 생성
  const buildLadder = useCallback((n, rows) => {
    // rungs[row][col] = true → col~col+1 사이에 가로줄
    const rungs = Array.from({ length: rows }, () => Array(n - 1).fill(false));
    for (let row = 0; row < rows; row++) {
      let col = 0;
      while (col < n - 1) {
        if (Math.random() < 0.45) {
          rungs[row][col] = true;
          col += 2; // 인접 가로줄 방지
        } else {
          col++;
        }
      }
    }
    return rungs;
  }, []);

  // 각 참여자의 경로 계산
  const calcPaths = useCallback((n, rungs, rows) => {
    return Array.from({ length: n }, (_, startCol) => {
      const path = [{ row: 0, col: startCol }];
      let col = startCol;
      for (let row = 0; row < rows; row++) {
        // 오른쪽 가로줄
        if (col < n - 1 && rungs[row][col]) {
          col++;
        // 왼쪽 가로줄
        } else if (col > 0 && rungs[row][col - 1]) {
          col--;
        }
        path.push({ row: row + 1, col });
      }
      return path;
    });
  }, []);

  // Canvas 전체 그리기
  const draw = useCallback((canvas, participants, rungs, rows, progressMap, highlightIdx) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const n = participants.length;
    const PAD_X = 36;
    const PAD_TOP = 44;
    const PAD_BOT = 44;
    const colW = (W - PAD_X * 2) / (n - 1 || 1);
    const rowH = (H - PAD_TOP - PAD_BOT) / rows;

    const cx = (col) => PAD_X + col * colW;
    const cy = (row) => PAD_TOP + row * rowH;

    ctx.clearRect(0, 0, W, H);

    // 세로줄
    for (let col = 0; col < n; col++) {
      ctx.beginPath();
      ctx.moveTo(cx(col), PAD_TOP);
      ctx.lineTo(cx(col), PAD_TOP + rows * rowH);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 가로줄
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < n - 1; col++) {
        if (rungs[row][col]) {
          ctx.beginPath();
          ctx.moveTo(cx(col), cy(row) + rowH * 0.5);
          ctx.lineTo(cx(col + 1), cy(row) + rowH * 0.5);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    }

    // 진행 경로 그리기 (애니메이션 중)
    if (progressMap) {
      participants.forEach((p, idx) => {
        const path = progressMap.paths[idx];
        const progress = progressMap.progresses[idx]; // 0~1
        const totalSteps = path.length - 1;
        const currentStep = Math.min(Math.floor(progress * totalSteps), totalSteps - 1);
        const stepFrac = (progress * totalSteps) - currentStep;

        const isHighlight = idx === highlightIdx;
        const color = COLORS[idx % COLORS.length];

        ctx.beginPath();
        // 이미 지나온 경로
        for (let s = 0; s <= currentStep; s++) {
          const from = path[s];
          const to = path[s + 1] || path[s];
          if (s === 0) ctx.moveTo(cx(from.col), cy(from.row));
          if (s < currentStep) {
            ctx.lineTo(cx(to.col), cy(to.row + (to.row > from.row ? 0 : 0)));
            // 가로 이동이면 같은 y
            const midY = from.row === to.row ? cy(from.row) + rowH * 0.5 : cy(to.row);
            ctx.lineTo(cx(to.col), midY);
          } else {
            // 현재 step 중간
            const fromX = cx(from.col);
            const toX = cx(to.col);
            const fromY = from.row === to.row ? cy(from.row) + rowH * 0.5 : cy(from.row);
            const toY = from.row === to.row ? cy(to.row) + rowH * 0.5 : cy(to.row);
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(fromX + (toX - fromX) * stepFrac, fromY + (toY - fromY) * stepFrac);
          }
        }
        ctx.strokeStyle = isHighlight ? color : color + '88';
        ctx.lineWidth = isHighlight ? 4 : 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();

        // 현재 위치 원형 마커
        const curFrom = path[currentStep];
        const curTo = path[currentStep + 1] || path[currentStep];
        const markerX = cx(curFrom.col) + (cx(curTo.col) - cx(curFrom.col)) * stepFrac;
        const markerFromY = curFrom.row === curTo.row ? cy(curFrom.row) + rowH * 0.5 : cy(curFrom.row);
        const markerToY = curFrom.row === curTo.row ? cy(curTo.row) + rowH * 0.5 : cy(curTo.row);
        const markerY = markerFromY + (markerToY - markerFromY) * stepFrac;

        ctx.beginPath();
        ctx.arc(markerX, markerY, isHighlight ? 9 : 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // 상단 닉네임
    participants.forEach((p, col) => {
      const color = COLORS[col % COLORS.length];
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(cx(col) - 22, 4, 44, 22, 6);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(8, Math.min(11, 88 / n))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = p.nickname.length > 4 ? p.nickname.slice(0, 3) + '…' : p.nickname;
      ctx.fillText(label, cx(col), 15);
    });

    // 하단 결과 번호
    for (let col = 0; col < n; col++) {
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(cx(col), H - 22, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(col + 1, cx(col), H - 22);
    }
  }, [COLORS, buildLadder]);

  // 초기 그리기
  useEffect(() => {
    if (!canvasRef.current || participants.length === 0) return;
    const n = participants.length;
    const rows = Math.max(5, Math.min(10, n + 3));
    const rungs = buildLadder(n, rows);
    const paths = calcPaths(n, rungs, rows);
    ladderDataRef.current = { n, rows, rungs, paths };
    draw(canvasRef.current, participants, rungs, rows, null, -1);
  }, [participants]);

  // 애니메이션 실행
  useEffect(() => {
    if (!isDrawing || !ladderDataRef.current || !canvasRef.current) return;

    const { n, rows, rungs, paths } = ladderDataRef.current;
    const winnerCol = Math.floor(Math.random() * n);
    const duration = 3500 + n * 200;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const rawProg = Math.min(elapsed / duration, 1);
      // 감속 easing
      const eased = 1 - Math.pow(1 - rawProg, 3);

      const progresses = Array.from({ length: n }, (_, i) => {
        // 당첨자는 조금 늦게 도착해서 극적 효과
        const delay = i === winnerCol ? 0.05 : 0;
        return Math.min(Math.max(eased - delay, 0) / (1 - delay), 1);
      });

      draw(canvasRef.current, participants, rungs, rows,
        { paths, progresses }, winnerCol);

      if (rawProg < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // 완료
        onWinner(participants[paths[winnerCol][paths[winnerCol].length - 1].col]);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isDrawing]);

  return (
    <div className="w-full flex flex-col items-center space-y-1">
      <canvas
        ref={canvasRef}
        width={380}
        height={320}
        className="w-full rounded-xl bg-slate-50 border border-slate-200"
      />
      <p className="text-[10px] text-slate-400 font-bold">
        총 {participants.length}명 · 사다리 시뮬레이션
      </p>
    </div>
  );
}


function RouletteWheel({ participants, canvasRef, angleRef, drawFn }) {
  useEffect(() => {
    if (canvasRef.current && participants.length > 0) {
      drawFn(canvasRef.current, participants, angleRef.current);
    }
  }, [participants, canvasRef, angleRef, drawFn]);

  return (
    <div className="flex flex-col items-center space-y-2 w-full">
      <div className="relative flex items-center justify-center">
        {/* 상단 화살표 포인터 */}
        <div className="absolute -top-3 z-20 flex flex-col items-center drop-shadow-lg">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#ef4444">
            <path d="M12 20l-8-14h16z"/>
          </svg>
        </div>
        {/* 바깥 링 */}
        <div className="rounded-full p-1.5 bg-gradient-to-br from-slate-700 to-slate-900 shadow-2xl">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="rounded-full block"
          />
        </div>
      </div>
      {participants.length > 0 && (
        <p className="text-[10px] text-slate-400 font-bold">
          총 {participants.length}명 참여 · 화살표 위치 당첨
        </p>
      )}
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('main'); 
  
  // 데이터 상태 (Supabase에서 로딩)
  const [surveyResults, setSurveyResults] = useState([]);
  const [quizList, setQuizList] = useState([]);
  const [quizResponses, setQuizResponses] = useState([]);

  // Realtime Quiz Status
  const [currentAdminQuizId, setCurrentAdminQuizId] = useState(1);
  const [adminShowAnswer, setAdminShowAnswer] = useState(false);
  const [quizSessionActive, setQuizSessionActive] = useState(false); // 수료평가 세션 활성 여부
  const [quizActive, setQuizActive] = useState(false); // 실제 문제 송출 중 여부

  // --- PART 1 STATE ---
  const [userNickname, setUserNickname] = useState('');
  const [userMbti, setUserMbti] = useState('INFJ');
  const [currentSurveyStep, setCurrentSurveyStep] = useState(0); 
  const [tempAnswers, setTempAnswers] = useState({}); 
  const [vocText, setVocText] = useState('');
  const [aiReport, setAiReport] = useState(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(true);   // 자동 분석 ON/OFF
  const [autoAnalysisInterval, setAutoAnalysisInterval] = useState(3);    // N명 제출마다 1회 자동 분석

  // --- PART 2 STATE ---
  const [quizParticipant, setQuizParticipant] = useState('');
  const [waitingParticipants, setWaitingParticipants] = useState([]); // 대기열 참여자 목록
  const [quizTimer, setQuizTimer] = useState(10);
  const [adminTimer, setAdminTimer] = useState(10); // 관리자 화면 카운트다운
  const adminTimerRef = useRef(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [myAnswerHistory, setMyAnswerHistory] = useState([]);
  const [quizStartTime, setQuizStartTime] = useState(null);
  
  // 사운드 상태
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 추첨 관련
  const [drawWinner, setDrawWinner] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMethod, setDrawMethod] = useState('roulette'); 
  const [rouletteDegree, setRouletteDegree] = useState(0);
  const [rouletteSpinning, setRouletteSpinning] = useState(false);
  const rouletteCanvasRef = useRef(null);
  const rouletteAnimRef = useRef(null);
  const rouletteAngleRef = useRef(0);
  const [isRaffleModalOpen, setIsRaffleModalOpen] = useState(false);
  const [isRaffleAssigned, setIsRaffleAssigned] = useState(false);
  const [isLiveQuizModalOpen, setIsLiveQuizModalOpen] = useState(false);
  const [isQuizBankModalOpen, setIsQuizBankModalOpen] = useState(false);

  // 관리자 모드 비밀번호 입력
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');

  // 퀴즈 CRUD 모달/상태
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizEditTarget, setQuizEditTarget] = useState(null); 
  const [quizFormType, setQuizFormType] = useState('choice'); 
  const [quizFormQuestion, setQuizFormQuestion] = useState('');
  const [quizFormOptions, setQuizFormOptions] = useState(['', '', '', '']);
  const [quizFormAnswer, setQuizFormAnswer] = useState('');
  const [quizFormScore, setQuizFormScore] = useState(20);

  // 전역 알림 모달
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '' });

  const triggerAlert = (title, message) => {
    setAlertConfig({ isOpen: true, title, message });
  };

  // === SUPABASE 초기 데이터 로딩 + Realtime 구독 ===
  useEffect(() => {
    const loadAll = async () => {
      const [
        { data: surveys },
        { data: quizzes },
        { data: responses },
        { data: status }
      ] = await Promise.all([
        supabase.from('survey_results').select('*').order('timestamp', { ascending: true }),
        supabase.from('quiz_list').select('*').order('id', { ascending: true }),
        supabase.from('quiz_responses').select('*').order('timestamp', { ascending: true }),
        supabase.from('quiz_status').select('*').eq('id', 1).single(),
      ]);
      if (surveys) setSurveyResults(surveys);
      if (quizzes) setQuizList(quizzes);
      if (responses) {
        const normalized = responses.map(row => ({
          ...row,
          quiz_id: Number(row.quiz_id),
          is_correct: row.is_correct === true || row.is_correct === 'true',
          score_gained: Number(row.score_gained || 0),
          time_taken: Number(row.time_taken || 0),
        }));
        setQuizResponses(normalized);
      }
      // 대기열 참여자 로드
      const { data: participants } = await supabase
        .from('quiz_participants')
        .select('*')
        .order('joined_at', { ascending: true });
      if (participants) setWaitingParticipants(participants);
      if (status) {
        setCurrentAdminQuizId(status.current_quiz_id);
        setAdminShowAnswer(status.show_answer);
        setQuizSessionActive(status.session_active === true);
        setQuizActive(status.quiz_active === true);
        // 초기 로딩 시 타이머 복원
        if (status.quiz_active && status.timer_started_at) {
          setTimerStartedAt(status.timer_started_at);
        }
      }
    };
    loadAll();

    const channel = supabase
      .channel('workshop-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'survey_results' }, (payload) => {
        setSurveyResults(prev => [...prev, payload.new]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_list' }, async () => {
        const { data } = await supabase.from('quiz_list').select('*').order('id', { ascending: true });
        if (data) setQuizList(data);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quiz_responses' }, (payload) => {
        const row = payload.new;
        const normalized = {
          ...row,
          quiz_id: Number(row.quiz_id),
          is_correct: row.is_correct === true || row.is_correct === 'true',
          score_gained: Number(row.score_gained || 0),
          time_taken: Number(row.time_taken || 0),
        };
        setQuizResponses(prev => {
          // 같은 quiz_id + nickname 중복 제거 후 추가
          const filtered = prev.filter(r =>
            !(Number(r.quiz_id) === Number(row.quiz_id) && r.nickname === row.nickname)
          );
          return [...filtered, normalized];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quiz_responses' }, (payload) => {
        const row = payload.new;
        const normalized = {
          ...row,
          quiz_id: Number(row.quiz_id),
          is_correct: row.is_correct === true || row.is_correct === 'true',
          score_gained: Number(row.score_gained || 0),
          time_taken: Number(row.time_taken || 0),
        };
        setQuizResponses(prev => {
          const exists = prev.some(r =>
            (r.id && r.id === normalized.id) ||
            (Number(r.quiz_id) === Number(normalized.quiz_id) && r.nickname === normalized.nickname)
          );
          if (exists) {
            return prev.map(r =>
              ((r.id && r.id === normalized.id) ||
               (Number(r.quiz_id) === Number(normalized.quiz_id) && r.nickname === normalized.nickname))
                ? normalized
                : r
            );
          }
          return [...prev, normalized];
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quiz_participants' }, (payload) => {
        setWaitingParticipants(prev => {
          const exists = prev.find(p => p.nickname === payload.new.nickname);
          return exists ? prev : [...prev, payload.new];
        });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'quiz_participants' }, (payload) => {
        setWaitingParticipants(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quiz_participants' }, async () => {
        const { data } = await supabase.from('quiz_participants').select('*').order('joined_at', { ascending: true });
        if (data) setWaitingParticipants(data);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quiz_status' }, (payload) => {
        const prev = payload.old;
        const next = payload.new;
        setCurrentAdminQuizId(next.current_quiz_id);
        setAdminShowAnswer(next.show_answer);
        setQuizSessionActive(next.session_active === true);
        setQuizActive(next.quiz_active === true);

        // quiz_active가 새로 켜지면 (송출 개시) — timerStartedAt 저장
        if (!prev.quiz_active && next.quiz_active && next.timer_started_at) {
          setTimerStartedAt(next.timer_started_at);
          setHasSubmittedAnswer(false);
          setSelectedAnswer('');
          setQuizStartTime(Date.now());
        }
        // quiz_active 꺼지면 timerStartedAt 초기화
        if (prev.quiz_active && !next.quiz_active) {
          setTimerStartedAt(null);
        }

        // 문제가 바뀐 경우에만 응답 상태 초기화
        if (prev.current_quiz_id !== next.current_quiz_id) {
          setQuizTimer(10);
          setAdminTimer(10);
          setHasSubmittedAnswer(false);
          setSelectedAnswer('');
          setQuizStartTime(Date.now());
        }

        // 세션이 비활성화되면 참여자 타이머/응답 상태 초기화
        if (prev.session_active === true && next.session_active === false) {
          setQuizTimer(10);
          setAdminTimer(10);
          setHasSubmittedAnswer(false);
          setSelectedAnswer('');
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // === 타이머 동기화 ===
  // setInterval 드리프트 없이 timer_started_at 기준으로 매초 남은 시간을 직접 계산
  // 관리자/참가자 모두 동일한 서버 타임스탬프를 기준으로 하므로 완벽히 일치함
  const [timerStartedAt, setTimerStartedAt] = useState(null); // DB의 timer_started_at 저장

  useEffect(() => {
    if (!quizActive || !timerStartedAt) {
      setQuizTimer(10);
      setAdminTimer(10);
      return;
    }

    const calcRemaining = () => {
      const elapsed = (Date.now() - new Date(timerStartedAt).getTime()) / 1000;
      return Math.max(10 - elapsed, 0);
    };

    // 즉시 한 번 계산
    const initial = calcRemaining();
    setQuizTimer(Math.ceil(initial));
    setAdminTimer(Math.ceil(initial));

    const interval = setInterval(() => {
      const remaining = calcRemaining();
      const ceiled = Math.ceil(remaining);

      setAdminTimer(ceiled);

      if (currentView === 'part2-quiz') {
        setQuizTimer(ceiled);
        if (ceiled <= 0 && !hasSubmittedAnswer) {
          setHasSubmittedAnswer(true);
          submitQuizAnswer('시간 초과', 0);
        }
        if (ceiled > 0 && soundEnabled) playSound('tick');
      }

      if (remaining <= 0) clearInterval(interval);
    }, 250); // 250ms마다 체크해서 1초 단위 표시 오차를 최소화

    return () => clearInterval(interval);
  }, [quizActive, timerStartedAt, currentView]);

  // 화면 전환 로직
  // - 세션 시작(session_active=true): 대기 → 수료평가 준비 (part2-waiting 유지, quizSessionActive만 변경)
  // - 송출 개시(quiz_active=true): 수료평가 준비 → 퀴즈 화면
  // - 세션 중단(session_active=false): 퀴즈/준비 → 수료평가 대기
  useEffect(() => {
    // 송출 개시 시 퀴즈 화면으로 전환
    if (currentView === 'part2-waiting' && quizSessionActive && quizActive) {
      setHasSubmittedAnswer(false);
      setSelectedAnswer('');
      setQuizTimer(10);
      setCurrentView('part2-quiz');
    }
    // 세션 중단 시 대기 화면으로 복귀
    if ((currentView === 'part2-quiz' || currentView === 'part2-waiting') && !quizSessionActive) {
      setCurrentView('part2-waiting');
    }
    // 송출 중단(quiz_active=false)되면 퀴즈 → 준비 화면으로 복귀
    if (currentView === 'part2-quiz' && quizSessionActive && !quizActive) {
      setCurrentView('part2-waiting');
    }
  }, [quizSessionActive, quizActive, currentView]);

  const updateAdminStatus = async (quizId, showAnswer, sessionActive = quizSessionActive, quizActiveVal = quizActive) => {
    await supabase
      .from('quiz_status')
      .update({ current_quiz_id: quizId, show_answer: showAnswer, session_active: sessionActive, quiz_active: quizActiveVal })
      .eq('id', 1);
    setCurrentAdminQuizId(quizId);
    setAdminShowAnswer(showAnswer);
    setQuizSessionActive(sessionActive);
    setQuizActive(quizActiveVal);
  };

  // 수료평가 세션 시작 (참여자: 수료평가 대기 → 수료평가 준비)
  const startQuizSession = async () => {
    // 세션 시작: session_active=true, quiz_active는 false 유지 (문제는 아직 미공개)
    await supabase
      .from('quiz_status')
      .update({ session_active: true, quiz_active: false })
      .eq('id', 1);
    setQuizSessionActive(true);
    setQuizActive(false);
  };

  // 수료평가 세션 중단 (참여자: 수료평가 준비/진행 → 수료평가 대기)
  const stopQuizSession = async () => {
    await supabase
      .from('quiz_status')
      .update({ session_active: false, quiz_active: false, show_answer: false })
      .eq('id', 1);
    setQuizSessionActive(false);
    setQuizActive(false);
    setAdminShowAnswer(false);
    setMyAnswerHistory([]);
  };

  // 문제 송출 개시 (quiz_active=true → 참여자 화면에 문제 공개)
  const broadcastQuiz = async (quizId) => {
    const now = new Date().toISOString();
    await supabase
      .from('quiz_status')
      .update({ current_quiz_id: quizId, quiz_active: true, show_answer: false, timer_started_at: now })
      .eq('id', 1);
    setCurrentAdminQuizId(quizId);
    setQuizActive(true);
    setAdminShowAnswer(false);
    setTimerStartedAt(now);
    setAdminTimer(10);
  };

  // 문제 송출 중단 (quiz_active=false → 참여자 준비 화면으로 복귀)
  const stopBroadcast = async () => {
    await supabase
      .from('quiz_status')
      .update({ quiz_active: false, show_answer: false, timer_started_at: null })
      .eq('id', 1);
    setQuizActive(false);
    setAdminShowAnswer(false);
    setTimerStartedAt(null);
    setAdminTimer(10);
  };

  // --- PART 1 설문 응답 핸들러 ---
  const handleSatisfactionSelect = (val) => {
    const qKey = `sat_${SATISFACTION_QUESTIONS[currentSurveyStep].id}`;
    setTempAnswers(prev => ({ ...prev, [qKey]: val }));
    setTimeout(() => {
      setCurrentSurveyStep(prev => prev + 1);
    }, 200);
  };

  const handleBalanceSelect = (option) => {
    const balanceIndex = currentSurveyStep - 10;
    const qKey = `bal_${BALANCE_QUESTIONS[balanceIndex].id}`;
    setTempAnswers(prev => ({ ...prev, [qKey]: option }));
    setTimeout(() => {
      setCurrentSurveyStep(prev => prev + 1);
    }, 200);
  };

  const submitSurvey = async () => {
    const payload = {
      id: Date.now().toString(),
      nickname: userNickname,
      mbti: userMbti,
      responses: tempAnswers,
      voc: vocText,
      timestamp: new Date().toISOString()
    };
    const { error } = await supabase.from('survey_results').insert([payload]);
    if (error) {
      triggerAlert("오류", "설문 저장 중 오류가 발생했습니다: " + error.message);
      return;
    }
    triggerAlert("설문 완료", `${userNickname}님의 소중한 조직개선 피드백이 전송되었습니다!`);
    setCurrentView('main');
    setUserNickname('');
    setTempAnswers({});
    setVocText('');
    setCurrentSurveyStep(0);

    // --- 자동 AI 분석 트리거 ---
    // 설문 제출 후 surveyResults는 Realtime으로 업데이트되므로
    // 현재 제출 포함 인원을 직접 계산
    if (autoAnalysisEnabled && !isAiAnalyzing) {
      const { data: latest } = await supabase
        .from('survey_results')
        .select('id', { count: 'exact' });
      const currentCount = latest ? latest.length : (surveyResults.length + 1);
      // N명 제출마다 자동 분석 실행 (예: 3명이면 3, 6, 9, ...번째 제출 시)
      if (autoAnalysisInterval > 0 && currentCount % autoAnalysisInterval === 0) {
        // 약간의 딜레이 후 실행 (Realtime 반영 대기)
        setTimeout(() => requestAiAnalysis(), 1500);
      }
    }
  };

  // --- 통계 및 지형도 분석 연산 ---
  const calculateSurveyStats = () => {
    if (surveyResults.length === 0) return null;

    const categoryTotals = { "소통": 0, "업무": 0, "성장": 0, "자율": 0, "효율": 0, "문화": 0 };
    const categoryCounts = { "소통": 0, "업무": 0, "성장": 0, "자율": 0, "효율": 0, "문화": 0 };

    SATISFACTION_QUESTIONS.forEach(q => {
      surveyResults.forEach(res => {
        const val = res.responses[`sat_${q.id}`];
        if (val) {
          categoryTotals[q.category] += val;
          categoryCounts[q.category] += 1;
        }
      });
    });

    const satisfactionScores = {};
    Object.keys(categoryTotals).forEach(cat => {
      satisfactionScores[cat] = categoryCounts[cat] > 0 
        ? (categoryTotals[cat] / categoryCounts[cat]).toFixed(2) 
        : "0";
    });

    const balanceStats = {
      "소통": { A: 0, B: 0 },
      "업무": { A: 0, B: 0 },
      "성장": { A: 0, B: 0 },
      "자율": { A: 0, B: 0 },
      "효율": { A: 0, B: 0 },
      "문화": { A: 0, B: 0 }
    };

    BALANCE_QUESTIONS.forEach(q => {
      surveyResults.forEach(res => {
        const ans = res.responses[`bal_${q.id}`];
        if (ans === 'A') balanceStats[q.category].A += 1;
        if (ans === 'B') balanceStats[q.category].B += 1;
      });
    });

    const mbtiCounts = {};
    surveyResults.forEach(res => {
      const m = res.mbti;
      mbtiCounts[m] = (mbtiCounts[m] || 0) + 1;
    });

    return {
      totalParticipants: surveyResults.length,
      satisfactionScores,
      balanceStats,
      mbtiCounts
    };
  };

  // --- GEMINI AI 분석 리포트 API 연동 ---
  const requestAiAnalysis = async () => {
    const stats = calculateSurveyStats();
    if (!stats) return;

    setIsAiAnalyzing(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

    const systemPrompt = `당신은 건설산업 구매·계약 분야 20년 경력의 수석 조직문화 컨설턴트이자 인사관리 전문가입니다.
건설사 구매계약실의 특수성(협력사 계약·원가절감 압력·공정거래 준수·수직적 보고문화)을 깊이 이해합니다.
반드시 아래 JSON 형식으로만 응답하세요. JSON 외 어떤 텍스트도 출력하지 마세요.
각 항목은 핵심만 담은 1~2문장으로 작성하고, 상투적 표현과 근거 없는 추측은 금지합니다.`;

    const mbtiGroupAnalysis = (() => {
      const groups = {
        "분석가(NT)": ["INTJ","INTP","ENTJ","ENTP"],
        "외교관(NF)": ["INFJ","INFP","ENFJ","ENFP"],
        "관리자(SJ)": ["ISTJ","ISFJ","ESTJ","ESFJ"],
        "탐험가(SP)": ["ISTP","ISFP","ESTP","ESFP"],
      };
      return Object.entries(groups).map(([g, types]) => {
        const cnt = types.reduce((s, t) => s + (stats.mbtiCounts[t] || 0), 0);
        return `${g}: ${cnt}명`;
      }).join(' / ');
    })();

    const userQuery = `
[2026 구매계약실 워크샵 — 조직진단 설문 데이터]
총 응답자: ${stats.totalParticipants}명
만족도 평점(5점): ${JSON.stringify(stats.satisfactionScores)}
밸런스 성향(A선택수 vs B선택수): ${JSON.stringify(stats.balanceStats)}
MBTI 개별: ${JSON.stringify(stats.mbtiCounts)}
MBTI 그룹: ${mbtiGroupAnalysis}
VOC: [${surveyResults.map(r => r.voc).filter(v => v).join(' / ')}]

위 데이터를 분석하여 아래 JSON 형식으로만 응답하세요:

{
  "satisfaction": {
    "strength": "만족도 강점 부문과 핵심 이유 1~2문장",
    "weakness": "만족도 취약 부문과 구체적 리스크 1~2문장",
    "recommend": "즉시 실행 가능한 개선 권장사항 1~2문장",
    "caution": "방치 시 조직 리스크 경고 1문장"
  },
  "balance": {
    "strength": "긍정적 성향 쏠림과 실무 강점 1~2문장",
    "weakness": "70% 이상 편향 차원과 그로 인한 조직 약점 1~2문장",
    "recommend": "성향 균형을 위한 실행 방안 1~2문장",
    "caution": "쏠림 현상 지속 시 리스크 1문장"
  },
  "mbti": {
    "strength": "현재 MBTI 구성의 업무 강점 1~2문장",
    "weakness": "구성상 취약한 역량 영역 1~2문장",
    "recommend": "MBTI 다양성 활용 방안 1~2문장",
    "caution": "집단사고 또는 갈등 패턴 경고 1문장"
  },
  "integrated": {
    "insight": "3개 데이터 교차분석으로 발견한 핵심 구조적 인사이트 2~3문장",
    "story": "왜 이 조직이 현재 상태인지 인과 서술 2문장",
    "topAction1": "최우선 개선과제 명칭과 실행방안 핵심 1~2문장",
    "topAction2": "2순위 개선과제 명칭과 실행방안 핵심 1~2문장",
    "topAction3": "3순위 개선과제 명칭과 실행방안 핵심 1~2문장"
  }
}`;

    const makeRequest = async (retries = 5, delay = 1000) => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("정상적인 텍스트 응답을 받지 못했습니다.");
        return text;
      } catch (err) {
        if (retries > 0) {
          await new Promise(res => setTimeout(res, delay));
          return makeRequest(retries - 1, delay * 2);
        }
        throw err;
      }
    };

    try {
      const resultText = await makeRequest();
      // JSON 파싱 시도 (```json ... ``` 블록 제거 후)
      const clean = resultText.replace(/```json|```/g, '').trim();
      let parsed = null;
      try { parsed = JSON.parse(clean); } catch { parsed = null; }
      const reportData = {
        generatedAt: new Date().toLocaleDateString(),
        content: resultText,
        parsed,
      };
      setAiReport(reportData);
      triggerAlert("AI 분석 완료", "Gemini가 조직개선 피드백을 종합 분석하였습니다!");
    } catch (error) {
      console.error(error);
      triggerAlert("분석 실패", `오류: ${error.message}`);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // --- PART 2 퀴즈 응답 제출 ---
  const submitQuizAnswer = async (answerText, timeLeft) => {
    if (hasSubmittedAnswer) return;
    setHasSubmittedAnswer(true);

    const quiz = quizList.find(q => q.id === currentAdminQuizId) || quizList[0];
    if (!quiz) return;

    const isCorrect = String(answerText).trim().toLowerCase() === String(quiz.answer).trim().toLowerCase();
    const timeTaken = 10 - timeLeft;
    const scoreGained = isCorrect ? Math.max(quiz.score - timeTaken, 1) : 0;

    if (answerText !== '시간 초과') {
      setMyAnswerHistory(prev => {
        if (prev.find(h => h.quizId === quiz.id)) return prev;
        return [...prev, {
          quizId: quiz.id,
          quizNum: quizList.findIndex(q => q.id === quiz.id) + 1,
          isCorrect,
          score: isCorrect ? quiz.score : 0,
          timeTaken,
        }];
      });
    }

    if (soundEnabled) {
      playSound(isCorrect ? 'success' : 'fail');
    }

    const { data, error } = await supabase.from('quiz_responses').upsert([{
      quiz_id: Number(quiz.id),
      nickname: quizParticipant,
      submitted_answer: String(answerText),
      is_correct: isCorrect,
      score_gained: scoreGained,
      time_taken: timeTaken,
    }], { onConflict: 'quiz_id,nickname' }).select();

    if (error) {
      console.error('quiz_responses INSERT 오류:', error);
      triggerAlert('제출 오류', `답안 저장 실패: ${error.message}`);
      setHasSubmittedAnswer(false);
      return;
    }

    // Realtime이 느릴 경우 직접 state에도 반영 (중복 닉네임은 교체)
    if (data && data.length > 0) {
      const row = data[0];
      const normalized = {
        ...row,
        quiz_id: Number(row.quiz_id),
        is_correct: row.is_correct === true || row.is_correct === 'true',
        score_gained: Number(row.score_gained || 0),
        time_taken: Number(row.time_taken || 0),
      };
      setQuizResponses(prev => {
        // 같은 quiz_id + nickname이 이미 있으면 교체, 없으면 추가
        const filtered = prev.filter(r =>
          !(Number(r.quiz_id) === Number(row.quiz_id) && r.nickname === row.nickname)
        );
        return [...filtered, normalized];
      });
    }
  };

  // --- 실시간 퀴즈 정답자 추첨 시뮬레이터 ---
  // Canvas 룰렛 그리기 함수
  const drawRouletteWheel = useCallback((canvas, participants, angleDeg) => {
    if (!canvas || participants.length === 0) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(cx, cy) - 8;
    const n = participants.length;
    const sliceAngle = (2 * Math.PI) / n;
    const COLORS = [
      '#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6',
      '#ec4899','#14b8a6','#f97316','#6366f1','#84cc16',
      '#0ea5e9','#a855f7','#22c55e','#fb923c','#e879f9',
      '#38bdf8','#4ade80','#fbbf24','#f87171','#c084fc',
    ];

    ctx.clearRect(0, 0, W, H);

    // 바깥 그림자 원
    ctx.beginPath();
    ctx.arc(cx, cy, R + 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();

    const startAngle = (angleDeg * Math.PI) / 180 - Math.PI / 2;

    participants.forEach((p, i) => {
      const a0 = startAngle + sliceAngle * i;
      const a1 = a0 + sliceAngle;
      const mid = (a0 + a1) / 2;

      // 파이 조각
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, a0, a1);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 닉네임 텍스트
      ctx.save();
      ctx.translate(cx + Math.cos(mid) * R * 0.62, cy + Math.sin(mid) * R * 0.62);
      ctx.rotate(mid + Math.PI / 2);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(9, Math.min(13, 120 / n))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 3;
      // 긴 닉네임 자르기
      const label = p.nickname.length > 6 ? p.nickname.slice(0, 5) + '…' : p.nickname;
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });

    // 중앙 원
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 중앙 별 모양
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', cx, cy);
  }, []);

  const startDrawing = () => {
    const currentQuiz = quizList.find(q => q.id === currentAdminQuizId) || quizList[0];
    const allForQ = quizResponses.filter(r => Number(r.quiz_id) === Number(currentQuiz.id));
    const deduped = Object.values(
      allForQ.reduce((acc, r) => {
        acc[r.nickname] = r;
        return acc;
      }, {})
    ).filter(r => r.submitted_answer !== '시간 초과');
    const correctResponses = deduped.filter(r => r.is_correct === true);

    if (correctResponses.length === 0) {
      triggerAlert("추첨 불가능", "해당 문제의 정답자가 존재하지 않아 추첨할 수 없습니다.");
      return;
    }

    setIsDrawing(true);
    setDrawWinner(null);
    if (soundEnabled) playSound('drumroll');

    if (drawMethod === 'roulette') {
      const canvas = rouletteCanvasRef.current;
      if (!canvas) return;

      // 당첨자 결정
      const winnerIndex = Math.floor(Math.random() * correctResponses.length);
      const winner = correctResponses[winnerIndex];
      const n = correctResponses.length;
      const sliceAngle = 360 / n;

      // 당첨 조각이 상단(화살표 위치)에 오도록 목표 각도 계산
      // 화살표는 12시 방향 (270도 = -90도)
      // 당첨자 조각 중앙이 상단에 오려면: -(winnerIndex * sliceAngle + sliceAngle/2)
      const targetAngle = -(winnerIndex * sliceAngle + sliceAngle / 2);
      // 최소 5바퀴 + 목표 각도
      const totalSpin = 360 * 6 + ((targetAngle % 360) + 360) % 360;

      const duration = 5500; // ms
      const startTime = performance.now();
      const startAngle = rouletteAngleRef.current;

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easeOutCubic — 천천히 감속
        const ease = 1 - Math.pow(1 - progress, 4);
        const currentAngle = startAngle + totalSpin * ease;
        rouletteAngleRef.current = currentAngle;

        drawRouletteWheel(canvas, correctResponses, currentAngle);

        if (progress < 1) {
          rouletteAnimRef.current = requestAnimationFrame(animate);
        } else {
          // 완전히 멈춤
          rouletteAngleRef.current = startAngle + totalSpin;
          setRouletteSpinning(false);
          setIsDrawing(false);
          setDrawWinner(winner);
          if (soundEnabled) playSound('success');
        }
      };

      setRouletteSpinning(true);
      rouletteAnimRef.current = requestAnimationFrame(animate);

    } else {
      // 사다리 모드: LadderGame 컴포넌트의 useEffect(isDrawing)가 애니메이션과 당첨자 처리를 담당
      // setIsDrawing(true)만 하면 됨 — 당첨자는 onWinner 콜백으로 전달됨
    }
  };

  // --- 퀴즈 명예의 전당 Top 5 산출 ---
  const calculateLeaderboard = () => {
    const scores = {};

    // 문제별 닉네임 중복 제거 (최신 응답만 사용)
    const quizIds = [...new Set(quizResponses.map(r => r.quiz_id))];
    const dedupedAll = quizIds.flatMap(qid => {
      const forQ = quizResponses.filter(r => Number(r.quiz_id) === Number(qid));
      return Object.values(
        forQ.reduce((acc, r) => {
          if (!acc[r.nickname] || r.id > acc[r.nickname].id) acc[r.nickname] = r;
          return acc;
        }, {})
      );
    });

    dedupedAll.forEach(res => {
      if (!scores[res.nickname]) {
        scores[res.nickname] = { nickname: res.nickname, totalScore: 0, totalTime: 0, correctCount: 0 };
      }
      if (res.is_correct) {
        const quiz = quizList.find(q => Number(q.id) === Number(res.quiz_id));
        const baseScore = quiz ? quiz.score : (res.score_gained || 0);
        scores[res.nickname].totalScore += baseScore;
        scores[res.nickname].correctCount += 1;
      }
      scores[res.nickname].totalTime += res.time_taken;
    });

    return Object.values(scores)
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        return a.totalTime - b.totalTime;
      })
      .slice(0, 5);
  };

  // --- 관리자 로그인 검증 ---
  const handleAdminLogin = () => {
    if (adminPasswordInput === ADMIN_PASSWORD) {
      setCurrentView('admin-dashboard');
      setAdminPasswordInput('');
      setAdminError('');
    } else {
      setAdminError('비밀번호가 일치하지 않습니다.');
    }
  };

  // --- 데이터 초기화 기능 ---
  const resetPart1Data = async () => {
    if (window.confirm("진짜로 모든 조직개선 설문조사 결과 및 AI 리포트 데이터를 초기화하시겠습니까?")) {
      await supabase.from('survey_results').delete().neq('id', '');
      setSurveyResults([]);
      setAiReport(null);
      triggerAlert("초기화 완료", "파트1 데이터가 성공적으로 삭제되었습니다.");
    }
  };

  const resetPart2Data = async () => {
    if (window.confirm("진짜로 모든 퀴즈 참가자 제출 데이터 및 랭킹 정보를 초기화하시겠습니까?")) {
      await supabase.from('quiz_responses').delete().neq('id', 0);
      await supabase.from('quiz_participants').delete().neq('id', 0);
      setQuizResponses([]);
      setWaitingParticipants([]);
      await updateAdminStatus(1, false);
      triggerAlert("초기화 완료", "파트2 데이터가 완벽하게 초기화되었습니다.");
    }
  };

  const handleDownloadExcel = async () => {
    if (surveyResults.length === 0) {
      triggerAlert("다운로드 실패", "다운로드할 설문 데이터가 없습니다.");
      return;
    }

    try {
      // CDN에서 XLSX 라이브러리 동적 로드
      if (!window.XLSX) {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      const XLSX = window.XLSX;

      // 데이터 변환
      const data = surveyResults.map(res => {
        const row = {
          "제출 시간": res.timestamp ? new Date(res.timestamp).toLocaleString() : "",
          "성격유형 (MBTI)": res.mbti || "",
        };

        // 만족도 조사 답변 추가
        SATISFACTION_QUESTIONS.forEach(q => {
          row[`만족도 Q${q.id} [${q.category}]: ${q.text}`] = res.responses[`sat_${q.id}`] || "";
        });

        // 밸런스 게임 답변 추가
        BALANCE_QUESTIONS.forEach(q => {
          const ans = res.responses[`bal_${q.id}`];
          row[`밸런스 Q${q.id} [${q.category}]: ${q.text}`] = ans ? (ans === 'A' ? "A: " + q.optionA : "B: " + q.optionB) : "";
        });

        // VOC 추가
        row["VOC 의견"] = res.voc || "";

        return row;
      });

      // 워크시트 생성
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "설문조사 결과");

      // 파일 생성 및 다운로드
      XLSX.writeFile(workbook, `조직개선_설문결과_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (error) {
      console.error("Excel download error", error);
      triggerAlert("오류 발생", "엑셀 파일을 다운로드하는 도중 오류가 발생했습니다.");
    }
  };

  // --- 퀴즈 관리 (CRUD) 함수들 ---
  const openQuizModal = (target = null) => {
    setQuizEditTarget(target);
    if (target) {
      setQuizFormType(target.type);
      setQuizFormQuestion(target.question);
      setQuizFormOptions(target.type === 'ox' ? ["O", "X"] : [...target.options]);
      setQuizFormAnswer(target.answer);
      setQuizFormScore(target.score);
    } else {
      setQuizFormType('choice');
      setQuizFormQuestion('');
      setQuizFormOptions(['', '', '', '']);
      setQuizFormAnswer('');
      setQuizFormScore(20);
    }
    setIsQuizModalOpen(true);
  };

  const handleSaveQuiz = async () => {
    if (!quizFormQuestion || !quizFormAnswer) {
      triggerAlert("입력 확인", "문제 내용과 정답은 반드시 입력되어야 합니다.");
      return;
    }

    const cleanOptions = quizFormType === 'ox' ? ["O", "X"] : quizFormOptions.filter(opt => opt.trim() !== '');
    const quizData = {
      type: quizFormType,
      question: quizFormQuestion,
      options: cleanOptions,
      answer: quizFormAnswer,
      score: Number(quizFormScore)
    };

    if (quizEditTarget) {
      await supabase.from('quiz_list').update(quizData).eq('id', quizEditTarget.id);
    } else {
      await supabase.from('quiz_list').insert([quizData]);
    }
    setIsQuizModalOpen(false);
    // 편집 보드 모달에서 열었을 경우 다시 편집 보드로 복귀
    if (isQuizBankModalOpen) {
      setIsQuizBankModalOpen(true);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm("이 문제를 삭제하시겠습니까?")) {
      await supabase.from('quiz_list').delete().eq('id', id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      
      {/* GLOBAL GLASS HEADER */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-100 px-4 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('main')}>
            <div className="bg-gradient-to-tr from-cyan-500 to-emerald-400 p-2 rounded-xl text-white shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg md:text-xl tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                2026 구매계약실 상반기 워크샵
              </h1>
              <p className="text-xs text-slate-400 font-semibold tracking-wide">COORDINATOR & CO-PLAY SYSTEM</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title={soundEnabled ? "효과음 켜짐" : "효과음 꺼짐"}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-500" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setCurrentView('admin-login')} 
              className="flex items-center space-x-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-all"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">관리자</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-10 flex flex-col justify-start">
        
        {/* ======================================= */}
        {/* VIEW 1: MAIN LANDING                    */}
        {/* ======================================= */}
        {currentView === 'main' && (
          <div className="space-y-10">
            {/* 상단 웰컴 배너 */}
            <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 border border-emerald-100 rounded-2xl p-6 md:p-10 text-center relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/40 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-100/40 rounded-full blur-xl -ml-10 -mb-10" />
              
              <div className="inline-block bg-white border border-emerald-200/60 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-600 mb-4 shadow-sm">
                2026.06 상반기 워크숍 공식 플랫폼 🎉
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
                변화하는 조직, 함께하는 성장!<br className="hidden md:inline"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">구매계약실</span>의 내일을 함께 설계해 주세요.
              </h2>
              <p className="mt-3 text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
                파트1의 가치관 설문조사 결과를 바탕으로 AI가 조직 문화를 종합 진단하며,<br/> 
                파트2 실시간 퀴즈에서 수료 성적을 평가하고 영광의 1위를 선정합니다.
              </p>
            </div>

            {/* 핵심 거대 두 버튼 (파트 1 / 파트 2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 파트 1 거대카드 */}
              <div 
                onClick={() => setCurrentView('part1-join')}
                className="bg-white border border-slate-200/80 rounded-2xl p-8 hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer group relative flex flex-col justify-between"
              >
                <div>
                  <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">PART 1. 조직개선 설문조사</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    조직문화 건강도, 밸런스 게임 성향(6개 차원 × 3문항), 진솔한 VOC를 접수합니다. 여러분의 데이터가 실시간 AI 분석의 훌륭한 밑거름이 됩니다.
                  </p>
                </div>
                <div className="mt-8 flex items-center text-sm font-bold text-emerald-600">
                  설문 참여하러 가기 <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* 파트 2 거대카드 */}
              <div 
                onClick={() => setCurrentView('part2-join')}
                className="bg-white border border-slate-200/80 rounded-2xl p-8 hover:shadow-xl hover:border-cyan-300 transition-all cursor-pointer group relative flex flex-col justify-between"
              >
                <div>
                  <div className="bg-cyan-50 text-cyan-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">PART 2. 워크숍 수료 평가 퀴즈</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    상하반기 업무 역량과 워크숍 지식을 다루는 실시간 동기화 스피드 퀴즈! 빠른 답안 제출과 고득점으로 당당히 1등에 도전해 보세요.
                  </p>
                </div>
                <div className="mt-8 flex items-center text-sm font-bold text-cyan-600">
                  실시간 퀴즈 접속하기 <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* 하단 보조 세 버튼 (결과 보기 세트) */}
            <div className="border-t border-slate-200/60 pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => setCurrentView('part1-result')}
                  className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 flex items-center justify-center space-x-2 text-slate-700 font-semibold text-sm transition-all shadow-xs"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  <span>PART 1. 대시보드</span>
                </button>

                <button 
                  onClick={() => setCurrentView('part2-result')}
                  className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 flex items-center justify-center space-x-2 text-slate-700 font-semibold text-sm transition-all shadow-xs"
                >
                  <Award className="w-4 h-4 text-cyan-500" />
                  <span>PART 2. 리더보드</span>
                </button>

                <button 
                  onClick={() => setCurrentView('admin-login')}
                  className="bg-slate-100 hover:bg-slate-200 rounded-xl py-3.5 px-4 flex items-center justify-center space-x-2 text-slate-700 font-semibold text-sm transition-all shadow-xs"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>관리자 대시보드</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 2: PART 1 JOIN (설문 시작)         */}
        {/* ======================================= */}
        {currentView === 'part1-join' && (
          <div className="max-w-md mx-auto w-full bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-800 text-center mb-6">조직개선 설문조사 등록</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">활동 닉네임</label>
                <input 
                  type="text" 
                  value={userNickname} 
                  onChange={(e) => setUserNickname(e.target.value)} 
                  placeholder="예: 구매의정석, 네고왕"
                  className="w-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/80 outline-none rounded-xl px-4 py-3 text-base transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">성격유형 (MBTI)</label>
                <select 
                  value={userMbti}
                  onChange={(e) => setUserMbti(e.target.value)}
                  className="w-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/80 outline-none rounded-xl px-4 py-3 text-base bg-white transition-all"
                >
                  {['INFJ', 'INFP', 'INTJ', 'INTP', 'ISFJ', 'ISFP', 'ISTJ', 'ISTP', 'ENFJ', 'ENFP', 'ENTJ', 'ENTP', 'ESFJ', 'ESFP', 'ESTJ', 'ESTP'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => {
                  if(!userNickname.trim()) {
                    triggerAlert("닉네임 필수", "개인 식별을 위한 닉네임을 적어주세요!");
                    return;
                  }
                  setTempAnswers({});
                  setCurrentSurveyStep(0);
                  setCurrentView('part1-survey');
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center space-x-2"
              >
                <span>진단 및 설문 시작하기</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 3: PART 1 SURVEY (슬라이딩 문제)    */}
        {/* ======================================= */}
        {currentView === 'part1-survey' && (
          <div className="max-w-2xl mx-auto w-full">
            {/* 진행도 헤더 */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-3">
              <span>PROGRESS</span>
              <span>{currentSurveyStep + 1} / 29 ({(Math.round((currentSurveyStep + 1)/29 * 100))}% 완료)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full mb-8 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${(currentSurveyStep + 1) / 29 * 100}%` }}
              />
            </div>

            {/* 카드 몸체 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm relative min-h-[350px] flex flex-col justify-between">
              
              {/* 이전 단계 돌아가기 */}
              {currentSurveyStep > 0 && (
                <button 
                  onClick={() => setCurrentSurveyStep(prev => prev - 1)}
                  className="absolute top-4 left-4 text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" /> <span>이전 문항</span>
                </button>
              )}

              {/* 1. 만족도 조사 (0~9번 슬라이드) */}
              {currentSurveyStep < 10 && (
                <div className="py-6 space-y-6">
                  <div className="text-center">
                    <span className="bg-emerald-50 text-emerald-600 text-xs px-3 py-1.5 rounded-full font-bold">
                      만족도 평가 ({SATISFACTION_QUESTIONS[currentSurveyStep].category} 부문)
                    </span>
                    <h4 className="text-lg md:text-2xl font-extrabold text-slate-800 mt-5 leading-snug">
                      {SATISFACTION_QUESTIONS[currentSurveyStep].text}
                    </h4>
                  </div>

                  <div className="grid grid-cols-5 gap-2 pt-6">
                    {[1, 2, 3, 4, 5].map(val => (
                      <button
                        key={val}
                        onClick={() => handleSatisfactionSelect(val)}
                        className={`py-4 rounded-xl border text-sm md:text-base font-bold transition-all flex flex-col items-center justify-center space-y-1.5
                          ${tempAnswers[`sat_${SATISFACTION_QUESTIONS[currentSurveyStep].id}`] === val 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                      >
                        <span className="text-base md:text-lg">{val}</span>
                        <span className="text-[10px] md:text-xs">
                          {val === 1 ? "매우반대" : val === 3 ? "보통" : val === 5 ? "매우찬성" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. 조직문화 밸런스 게임 (10~27번 슬라이드) */}
              {currentSurveyStep >= 10 && currentSurveyStep < 28 && (() => {
                const balanceIndex = currentSurveyStep - 10;
                const currentBalanceQ = BALANCE_QUESTIONS[balanceIndex];
                const selectedVal = tempAnswers[`bal_${currentBalanceQ.id}`];

                return (
                  <div className="py-6 space-y-6">
                    <div className="text-center">
                      <span className="bg-cyan-50 text-cyan-600 text-xs px-3 py-1.5 rounded-full font-bold">
                        조직문화 밸런스 게임 ({currentBalanceQ.category})
                      </span>
                      <h4 className="text-lg md:text-2xl font-extrabold text-slate-800 mt-5 leading-snug">
                        {currentBalanceQ.text}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                      <button
                        onClick={() => handleBalanceSelect('A')}
                        className={`p-6 rounded-xl border text-left font-bold text-sm md:text-base transition-all relative flex flex-col justify-between group h-28
                          ${selectedVal === 'A' 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                      >
                        <span className="text-xs text-emerald-500 font-bold mb-2">선택 A</span>
                        <span className="group-hover:translate-x-1 transition-transform">{currentBalanceQ.optionA}</span>
                      </button>

                      <button
                        onClick={() => handleBalanceSelect('B')}
                        className={`p-6 rounded-xl border text-left font-bold text-sm md:text-base transition-all relative flex flex-col justify-between group h-28
                          ${selectedVal === 'B' 
                            ? 'bg-cyan-50 border-cyan-500 text-cyan-800 ring-2 ring-cyan-200' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                      >
                        <span className="text-xs text-cyan-500 font-bold mb-2">선택 B</span>
                        <span className="group-hover:translate-x-1 transition-transform">{currentBalanceQ.optionB}</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 3. VOC 및 최종 접수 (28번 슬라이드) */}
              {currentSurveyStep === 28 && (
                <div className="py-6 space-y-6">
                  <div className="text-center">
                    <span className="bg-purple-50 text-purple-600 text-xs px-3 py-1.5 rounded-full font-bold">VOC 서술형 (선택)</span>
                    <h4 className="text-lg md:text-2xl font-extrabold text-slate-800 mt-5 leading-snug">
                      기타 구매계약실에 제안하고 싶은 조직혁신 의견을 입력해주세요.
                    </h4>
                    <p className="text-xs text-slate-400 mt-2">이 항목은 입력을 건너뛰어도 좋습니다.</p>
                  </div>

                  <div className="space-y-4">
                    <textarea
                      value={vocText}
                      onChange={(e) => setVocText(e.target.value)}
                      placeholder="자유롭게 건의하고 싶으신 수평문화 제안, 프로세스 고충 및 제언을 자유롭게 적어주세요."
                      rows={5}
                      className="w-full border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200/80 outline-none rounded-xl p-4 text-sm transition-all bg-slate-50/50"
                    />

                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setVocText('');
                          submitSurvey();
                        }}
                        className="flex-1 border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold py-3 px-4 rounded-xl transition-all"
                      >
                        건너뛰기 & 완료
                      </button>
                      <button
                        onClick={submitSurvey}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:brightness-105 transition-all flex items-center justify-center space-x-1"
                      >
                        <Send className="w-4 h-4" />
                        <span>의견 제출하기</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 4: PART 1 RESULT & AI DASHBOARD     */}
        {/* ======================================= */}
        {currentView === 'part1-result' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 flex flex-wrap items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-emerald-500" />
                  <span>조직혁신 설문 결과 대시보드</span>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full">
                    총 {surveyResults.length}명 참여
                  </span>
                </h3>
                <p className="text-slate-500 text-sm mt-1">소중한 구매계약원의 피드백을 실시간 집계합니다.</p>
              </div>

              <div className="flex space-x-2 w-full sm:w-auto">
                <button 
                  onClick={() => setCurrentView('main')}
                  className="flex-1 sm:flex-none border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold py-2 px-4 rounded-lg text-sm transition-all"
                >
                  홈으로
                </button>
              </div>
            </div>

            {surveyResults.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="font-semibold text-lg">아직 제출된 설문 결과가 없습니다.</p>
                <p className="text-sm text-slate-400 mt-1">첫 번째 가치진단 설문조사를 먼저 완료해주세요!</p>
              </div>
            ) : (() => {
              const stats = calculateSurveyStats();
              if (!stats) return null;

              return (
                <div className="space-y-6">

                  {/* 부문별 만족도 평점 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-base font-bold text-slate-700 mb-4 border-b pb-2 flex items-center space-x-1.5">
                      <Smile className="w-4.5 h-4.5 text-emerald-500" />
                      <span>부문별 구매 만족도 평점 (5점 리커트)</span>
                    </h4>
                    <div className="space-y-4">
                      {Object.entries(stats.satisfactionScores).map(([cat, score]) => {
                        const percentage = (Number(score) / 5) * 100;
                        return (
                          <div key={cat} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-600">{cat} 부문</span>
                              <span className="text-slate-800">{score} / 5.00</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 6대 부문 밸런스 게임 성향 지형도 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-base font-bold text-slate-700 mb-4 border-b pb-2 flex items-center space-x-1.5">
                      <BarChart3 className="w-4.5 h-4.5 text-cyan-500" />
                      <span>6대 핵심 성향 밸런스 지형도</span>
                    </h4>
                    <p className="text-xs text-slate-400 mb-6">부서 내 구성원의 소통, 업무, 성장, 자율, 효율, 문화의 대칭적 가치관 조감도</p>
                    
                    {(() => {
                      const BALANCE_LABELS = {
                        "소통": { A: "지시·직접형", B: "합의·공감형" },
                        "업무": { A: "안정·전문형", B: "도전·유연형" },
                        "성장": { A: "실무·성과형", B: "비전·균형형" },
                        "자율": { A: "구조·규정형", B: "자율·유연형" },
                        "효율": { A: "절차·정확형", B: "속도·실용형" },
                        "문화": { A: "결속·공동체형", B: "개인·실속형" },
                      };
                      const BALANCE_DESC = {
                        "소통": "리더 스타일 · 피드백 방식 · 후배 지도",
                        "업무": "동료 선호 · 전문vs도전 · 업무 완수",
                        "성장": "격무vs워라밸 · 보상 방식 · 커리어 경로",
                        "자율": "보고 방식 · 유연근무 · 팀vs개인 목표",
                        "효율": "회의 방식 · 계약 협상 · 결재 프로세스",
                        "문화": "워크샵 선호 · 경조사 참여 · 업무외 연락",
                      };
                      return (
                        <div className="space-y-5">
                          {Object.entries(stats.balanceStats).map(([cat, val]) => {
                            const total = val.A + val.B;
                            const rateA = total > 0 ? Math.round((val.A / total) * 100) : 50;
                            const rateB = total > 0 ? 100 - rateA : 50;
                            const labels = BALANCE_LABELS[cat] || { A: "A형", B: "B형" };
                            const dominant = rateA >= rateB ? 'A' : 'B';
                            return (
                              <div key={cat} className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-bold">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-emerald-600">{labels.A}</span>
                                    <span className="text-emerald-500 font-black">({rateA}%)</span>
                                    {dominant === 'A' && <span className="text-[9px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">우세</span>}
                                  </div>
                                  <div className="text-center">
                                    <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">{cat} 차원</span>
                                    {BALANCE_DESC[cat] && (
                                      <p className="text-[9px] text-slate-400 mt-0.5">{BALANCE_DESC[cat]}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-1.5">
                                    {dominant === 'B' && <span className="text-[9px] bg-cyan-100 text-cyan-600 px-1.5 py-0.5 rounded-full font-bold">우세</span>}
                                    <span className="text-cyan-500 font-black">({rateB}%)</span>
                                    <span className="text-cyan-600">{labels.B}</span>
                                  </div>
                                </div>
                                <div className="relative w-full h-5 bg-slate-100 rounded-md overflow-hidden flex">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 border-r border-white/40"
                                    style={{ width: `${rateA}%` }}
                                  />
                                  <div
                                    className="h-full bg-gradient-to-r from-cyan-300 to-cyan-400"
                                    style={{ width: `${rateB}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* 구매계약실 MBTI 분포 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-700 mb-1">구매계약실 MBTI 분포</h4>
                    <p className="text-xs text-slate-400 mb-4">총 {Object.values(stats.mbtiCounts).reduce((a,b)=>a+b,0)}명 응답</p>
                    {(() => {
                      const MBTI_GROUPS = {
                        "분석가": { types: ["INTJ","INTP","ENTJ","ENTP"], color: "bg-violet-500", light: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
                        "외교관": { types: ["INFJ","INFP","ENFJ","ENFP"], color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
                        "관리자": { types: ["ISTJ","ISFJ","ESTJ","ESFJ"], color: "bg-cyan-500",   light: "bg-cyan-50",   text: "text-cyan-700",   border: "border-cyan-200"   },
                        "탐험가": { types: ["ISTP","ISFP","ESTP","ESFP"], color: "bg-amber-500",  light: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
                      };
                      const total = Object.values(stats.mbtiCounts).reduce((a,b)=>a+b,0);
                      return (
                        <div className="space-y-4">
                          {Object.entries(MBTI_GROUPS).map(([groupName, g]) => {
                            const groupTotal = g.types.reduce((sum, t) => sum + (stats.mbtiCounts[t] || 0), 0);
                            if (groupTotal === 0) return null;
                            return (
                              <div key={groupName}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-1.5">
                                    <span className={`w-2 h-2 rounded-full ${g.color}`} />
                                    <span className="text-xs font-bold text-slate-600">{groupName}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-semibold">{groupTotal}명 · {Math.round(groupTotal/total*100)}%</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {g.types.map(type => {
                                    const cnt = stats.mbtiCounts[type] || 0;
                                    if (cnt === 0) return null;
                                    const pct = Math.round(cnt / total * 100);
                                    return (
                                      <div key={type} className={`${g.light} border ${g.border} rounded-xl px-3 py-2 flex flex-col items-center min-w-[64px]`}>
                                        <span className={`text-sm font-black ${g.text}`}>{type}</span>
                                        <span className="text-slate-500 text-[11px] font-bold mt-0.5">{cnt}명</span>
                                        <span className="text-[10px] text-slate-400">{pct}%</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Gemini AI 분석 보고서 */}
                  <div className="bg-gradient-to-b from-cyan-50/70 to-emerald-50/40 border border-emerald-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-emerald-600 font-extrabold text-sm">
                        <Sparkles className="w-5 h-5" />
                        <span>Gemini 2.5 실시간 AI 리포트</span>
                      </div>
                      {aiReport && (
                        <span className="text-[10px] text-slate-400 font-bold">분석일: {aiReport.generatedAt}</span>
                      )}
                    </div>

                    {isAiAnalyzing ? (
                      <div className="space-y-4 py-10 text-center text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                        <p className="text-sm font-semibold">Gemini가 구매계약실 데이터를 분석 중입니다...</p>
                      </div>

                    ) : aiReport?.parsed ? (() => {
                      const r = aiReport.parsed;
                      const CARDS = [
                        {
                          key: 'satisfaction', title: '만족도 종합분석', icon: '📊',
                          color: 'border-blue-200 bg-blue-50/60', titleColor: 'text-blue-700',
                          data: r.satisfaction,
                        },
                        {
                          key: 'balance', title: '밸런스 지형도 종합분석', icon: '⚖️',
                          color: 'border-emerald-200 bg-emerald-50/60', titleColor: 'text-emerald-700',
                          data: r.balance,
                        },
                        {
                          key: 'mbti', title: 'MBTI 분포 종합분석', icon: '🧠',
                          color: 'border-violet-200 bg-violet-50/60', titleColor: 'text-violet-700',
                          data: r.mbti,
                        },
                      ];
                      const BADGE = [
                        { label: '강점', icon: '✅', bg: 'bg-emerald-100 text-emerald-700', key: 'strength' },
                        { label: '약점', icon: '⚠️', bg: 'bg-amber-100 text-amber-700', key: 'weakness' },
                        { label: '권장', icon: '💡', bg: 'bg-blue-100 text-blue-700', key: 'recommend' },
                        { label: '유의', icon: '🔴', bg: 'bg-rose-100 text-rose-700', key: 'caution' },
                      ];
                      return (
                        <div className="space-y-4">
                          {/* 3개 카테고리 카드 */}
                          {CARDS.map(card => (
                            <div key={card.key} className={`border rounded-2xl p-4 ${card.color}`}>
                              <h5 className={`text-sm font-extrabold mb-3 flex items-center space-x-1.5 ${card.titleColor}`}>
                                <span>{card.icon}</span>
                                <span>{card.title}</span>
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {BADGE.map(b => (
                                  card.data?.[b.key] && (
                                    <div key={b.key} className="bg-white/80 rounded-xl p-2.5 space-y-1">
                                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full inline-block ${b.bg}`}>
                                        {b.icon} {b.label}
                                      </span>
                                      <p className="text-xs text-slate-700 leading-relaxed">{card.data[b.key]}</p>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          ))}

                          {/* 통합 분석 카드 */}
                          {r.integrated && (
                            <div className="border border-slate-300 bg-slate-800 rounded-2xl p-5 space-y-3">
                              <h5 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
                                <span>🔗</span>
                                <span>통합 종합분석</span>
                              </h5>
                              {r.integrated.insight && (
                                <div className="bg-white/10 rounded-xl p-3">
                                  <p className="text-[10px] font-bold text-slate-300 mb-1">🔍 핵심 인사이트</p>
                                  <p className="text-xs text-slate-100 leading-relaxed">{r.integrated.insight}</p>
                                </div>
                              )}
                              {r.integrated.story && (
                                <div className="bg-white/10 rounded-xl p-3">
                                  <p className="text-[10px] font-bold text-slate-300 mb-1">📖 조직 현황 진단</p>
                                  <p className="text-xs text-slate-100 leading-relaxed">{r.integrated.story}</p>
                                </div>
                              )}
                              {/* Action Items */}
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-300">🎯 최우선 개선과제</p>
                                {['topAction1','topAction2','topAction3'].map((k, i) => (
                                  r.integrated[k] && (
                                    <div key={k} className="bg-white/10 rounded-xl p-3 flex items-start space-x-2">
                                      <span className="text-amber-400 font-black text-xs shrink-0">{i+1}순위</span>
                                      <p className="text-xs text-slate-100 leading-relaxed">{r.integrated[k]}</p>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })() : aiReport ? (
                      /* JSON 파싱 실패 시 폴백 — 기존 텍스트 렌더링 */
                      <div className="text-xs text-slate-600 leading-relaxed space-y-1 pr-2">
                        <div className="text-[10px] text-slate-400 font-bold mb-2">분석일자: {aiReport.generatedAt}</div>
                        {aiReport.content.split('\n').map((line, idx) => {
                          if (line.startsWith('【') || line.startsWith('###') || line.startsWith('**')) {
                            return <h5 key={idx} className="font-extrabold text-slate-800 mt-4 mb-2 text-sm">{line.replace(/[\*#【】]/g, '')}</h5>;
                          }
                          return <p key={idx} className="mb-1 text-slate-600">{line.replace(/\*/g, '')}</p>;
                        })}
                      </div>
                    ) : (
                      <div className="py-10 text-center text-slate-400">
                        <Sparkles className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm font-bold">아직 생성된 AI 분석이 없습니다.</p>
                      </div>
                    )}
                  </div>

                  {/* 종합 VOC 키워드 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-700 mb-3">종합 VOC 키워드 (최근)</h4>
                    <div className="space-y-2 text-xs">
                      {surveyResults.map(r => r.voc).filter(v => v).length === 0 ? (
                        <p className="text-slate-400">아직 접수된 서술형 VOC가 없습니다.</p>
                      ) : (
                        surveyResults.map((res, i) => (
                          <div key={i} className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-slate-600 leading-normal">
                            "{res.voc}"
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 5: PART 2 JOIN (실시간 퀴즈 등록)    */}
        {/* ======================================= */}
        {currentView === 'part2-join' && (
          <div className="max-w-md mx-auto w-full bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-800 text-center mb-6 flex flex-col items-center">
              <span className="bg-cyan-50 text-cyan-600 text-xs px-3 py-1.5 rounded-full font-bold mb-2">실시간 멀티플레이어</span>
              <span>퀴즈 배틀 참가자 등록</span>
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">대결용 실명 닉네임</label>
                <input 
                  type="text" 
                  value={quizParticipant} 
                  onChange={(e) => setQuizParticipant(e.target.value)} 
                  placeholder="예: 홍길동 대리, 김구매 과장"
                  className="w-full border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200/80 outline-none rounded-xl px-4 py-3 text-base transition-all"
                />
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-slate-500 space-y-1">
                <p className="font-bold text-slate-600">💡 참여 수칙</p>
                <p>- 관리자가 문제를 실시간으로 활성화해 주어야 화면이 넘어갑니다.</p>
                <p>- 문제당 제한시간은 딱 <span className="text-rose-500 font-bold">10초</span>입니다. 빨리 풀수록 랭킹 가중치가 오릅니다.</p>
              </div>

              <button 
                onClick={async () => {
                  if(!quizParticipant.trim()) {
                    triggerAlert("이름 필요", "실명 기반의 닉네임을 적어주세요!");
                    return;
                  }
                  // 대기열에 참여자 등록 (중복 방지)
                  await supabase.from('quiz_participants')
                    .upsert([{ nickname: quizParticipant, status: 'waiting', joined_at: new Date().toISOString() }],
                      { onConflict: 'nickname' });
                  setHasSubmittedAnswer(false);
                  setSelectedAnswer('');
                  setQuizTimer(10);
                  setQuizStartTime(Date.now());
                  setCurrentView('part2-waiting');
                }}
                className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:brightness-105 transition-all"
              >
                대기열 진입
              </button>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 5-B: PART 2 WAITING ROOM            */}
        {/* ======================================= */}
        {currentView === 'part2-waiting' && (
          <div className="max-w-md mx-auto w-full">
            {!quizSessionActive ? (
              /* 수료평가 대기 상태 */
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto">
                  <Coffee className="w-10 h-10 text-slate-500 animate-bounce" />
                </div>
                <div>
                  <div className="inline-block bg-slate-100 border border-slate-200 text-slate-600 text-xs font-black px-4 py-1.5 rounded-full mb-3">
                    ⏳ 수료평가 대기
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mt-2">대기열 진입 완료!</h3>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    <span className="font-bold text-slate-700">{quizParticipant}</span>님, 환영합니다!
                    <br/>관리자가 수료평가를 시작할 때까지 잠시 대기해 주세요.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-xs text-slate-500 text-left">
                  <p className="font-bold text-slate-700">💡 참여 안내</p>
                  <p>• 관리자가 시작 버튼을 누르면 <span className="text-cyan-600 font-bold">수료평가 준비</span> 상태로 변경됩니다.</p>
                  <p>• 문제당 제한시간은 <span className="text-rose-500 font-bold">10초</span>입니다.</p>
                  <p>• 이 페이지를 닫지 마세요. 자동으로 상태가 업데이트됩니다.</p>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-amber-600">관리자 시작 신호 대기 중...</span>
                </div>
              </div>
            ) : (
              /* 수료평가 준비 상태 — 세션은 시작됐지만 문제는 아직 미송출 */
              <div className="bg-white border-2 border-cyan-300 rounded-2xl p-8 shadow-lg text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full animate-ping" style={{left: '55%'}} />
                </div>
                <div>
                  <div className="inline-block bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-black px-4 py-1.5 rounded-full mb-3">
                    ✅ 수료평가 준비
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mt-2">평가가 곧 시작됩니다!</h3>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    <span className="font-bold text-cyan-600">{quizParticipant}</span>님, 대기 완료!
                    <br/>관리자가 문제를 송출하면 자동으로 화면이 전환됩니다.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold text-cyan-600">문제 송출 대기 중...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 6: PART 2 QUIZ (실시간 플레이어 방)   */}
        {/* ======================================= */}
        {currentView === 'part2-quiz' && (() => {
          const currentQuiz = quizList.find(q => q.id === currentAdminQuizId) || quizList[0];
          if (!currentQuiz) {
            return (
              <div className="max-w-md mx-auto text-center py-10 bg-white border rounded-2xl">
                <Coffee className="w-12 h-12 text-cyan-500 mx-auto mb-4 animate-bounce" />
                <p className="font-semibold text-slate-600">진행 예정인 문제가 아직 없습니다.</p>
                <p className="text-xs text-slate-400 mt-1">관리자의 신호 전송을 대기하고 있습니다.</p>
              </div>
            );
          }

          return (
            <div className="max-w-2xl mx-auto w-full space-y-6">
              
              {/* 상단 뱃지 및 타이머 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2">
                  <span className="bg-cyan-100 text-cyan-700 text-xs font-black px-2.5 py-1 rounded-md">
                    문제 {currentQuiz.id}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">유형: {currentQuiz.type === 'choice' ? '객관식' : currentQuiz.type === 'ox' ? 'OX' : '주관식'} ({currentQuiz.score}점)</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-500">제한시간</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-sm transition-all
                    ${quizTimer <= 3 ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {quizTimer}
                  </div>
                </div>
              </div>

              {/* 문제 상세 카드 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm space-y-8 min-h-[250px] flex flex-col justify-between">
                <div>
                  <h4 className="text-xl md:text-2xl font-black text-slate-800 leading-snug">
                    {currentQuiz.question}
                  </h4>
                </div>

                {/* 답안 입력 UI */}
                {hasSubmittedAnswer ? (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                    <CheckCircle className="w-10 h-10 text-cyan-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">답안 제출을 완료했습니다!</p>
                    <p className="text-xs text-slate-400 mt-1">관리자가 정답과 분포를 오픈할 때까지 잠시 대기해주세요.</p>
                    {selectedAnswer && selectedAnswer !== '시간 초과' && (
                      <div className="mt-3 inline-block bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-2">
                        <p className="text-xs text-slate-500 font-semibold">제출한 답안</p>
                        <p className="text-base font-black text-cyan-700 mt-0.5">{selectedAnswer}</p>
                      </div>
                    )}
                    {selectedAnswer === '시간 초과' && (
                      <div className="mt-3 inline-block bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">
                        <p className="text-xs text-rose-500 font-bold">⏰ 시간 초과 — 미제출 처리됩니다.</p>
                      </div>
                    )}
                  </div>
                ) : quizTimer === 0 ? (
                  /* 타이머 종료 — 미제출 상태에서 시간 초과 */
                  <div className="text-center py-6 bg-rose-50 rounded-xl border border-rose-200">
                    <div className="text-3xl mb-2">⏰</div>
                    <p className="font-bold text-rose-700">시간이 종료되었습니다!</p>
                    <p className="text-xs text-rose-500 mt-1">이번 문제는 미제출로 처리됩니다.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* 1) 객관식 유형 */}
                    {currentQuiz.type === 'choice' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {currentQuiz.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedAnswer(opt)}
                              className={`border rounded-xl p-4 text-left font-semibold text-sm transition-all flex items-center space-x-3
                                ${selectedAnswer === opt
                                  ? 'bg-cyan-50 border-cyan-400 ring-2 ring-cyan-200'
                                  : 'bg-slate-50 hover:bg-cyan-50 hover:border-cyan-300 border-slate-200'
                                }`}
                            >
                              <span className={`rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold
                                ${selectedAnswer === opt ? 'bg-cyan-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {i+1}
                              </span>
                              <span>{opt}</span>
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            if (!selectedAnswer) {
                              triggerAlert("선택 필요", "보기를 먼저 선택해주세요.");
                              return;
                            }
                            submitQuizAnswer(selectedAnswer, quizTimer);
                          }}
                          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all"
                        >
                          응답 제출
                        </button>
                      </div>
                    )}

                    {/* 2) OX 유형 */}
                    {currentQuiz.type === 'ox' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          {["O", "X"].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setSelectedAnswer(opt)}
                              className={`p-8 rounded-xl border text-center font-black text-3xl transition-all
                                ${selectedAnswer === opt
                                  ? opt === 'O'
                                    ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-200 text-emerald-600'
                                    : 'bg-rose-100 border-rose-400 ring-2 ring-rose-200 text-rose-600'
                                  : opt === 'O'
                                    ? 'bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-600'
                                    : 'bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-rose-600'
                                }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            if (!selectedAnswer) {
                              triggerAlert("선택 필요", "O 또는 X를 먼저 선택해주세요.");
                              return;
                            }
                            submitQuizAnswer(selectedAnswer, quizTimer);
                          }}
                          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all"
                        >
                          응답 제출
                        </button>
                      </div>
                    )}

                    {/* 3) 주관식 유형 */}
                    {currentQuiz.type === 'short' && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={selectedAnswer}
                          onChange={(e) => setSelectedAnswer(e.target.value)}
                          placeholder="정답을 정확히 입력해주세요"
                          className="w-full border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200/80 outline-none rounded-xl px-4 py-3 text-base transition-all"
                        />
                        <button
                          onClick={() => {
                            if (!selectedAnswer.trim()) {
                              triggerAlert("정답 확인", "공란으로 제출할 수 없습니다.");
                              return;
                            }
                            submitQuizAnswer(selectedAnswer, quizTimer);
                          }}
                          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all"
                        >
                          응답 제출
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 관리자가 정답을 공개한 경우 */}
              {adminShowAnswer && (
                <div className={`border rounded-2xl p-5 ${
                  !selectedAnswer
                    ? 'bg-slate-50 border-slate-200'
                    : selectedAnswer.trim().toLowerCase() === currentQuiz.answer.trim().toLowerCase()
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-rose-50 border-rose-200'
                }`}>
                  <div className={`flex items-center space-x-2 font-extrabold text-sm mb-2 ${
                    !selectedAnswer
                      ? 'text-slate-600'
                      : selectedAnswer.trim().toLowerCase() === currentQuiz.answer.trim().toLowerCase()
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                  }`}>
                    <CheckCircle className="w-5 h-5" />
                    <span>출제자 정답 공개</span>
                  </div>
                  <p className="text-base font-bold text-slate-800">
                    정답은 바로 [ {currentQuiz.answer} ] 입니다!
                  </p>
                  {!selectedAnswer ? (
                    <p className="text-xs text-slate-400 mt-2 font-semibold">⚠️ 미제출 (시간 초과 또는 미응답)</p>
                  ) : selectedAnswer.trim().toLowerCase() === currentQuiz.answer.trim().toLowerCase() ? (
                    <p className="text-xs text-emerald-700 font-bold mt-2">
                      내가 제출한 답: <span className="font-black">{selectedAnswer}</span> &nbsp;⭕ 정답입니다!
                    </p>
                  ) : (
                    <p className="text-xs text-rose-600 font-bold mt-2">
                      내가 제출한 답: <span className="font-black">{selectedAnswer}</span> &nbsp;❌ 오답입니다.
                    </p>
                  )}
                </div>
              )}

              {/* 멀티플레이 시뮬레이터 안내 탭: 화살표 문자 에스케이프 처리 완료 */}
              <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-center text-xs text-slate-500">
                <p>💡 <b>[멀티플레이어 데모 안내]</b> 이 페이지를 새로운 브라우저 탭(창)으로 하나 더 열고, <br/> 
                새 창에서 <b>[관리자 로그인 {"->"} 어드민 대시보드]</b>에 접속하면 실시간으로 문제를 주도 및 전환하고 추첨을 즐기실 수 있습니다!</p>
              </div>

              {myAnswerHistory.length > 0 && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 border border-cyan-200 rounded-2xl p-4">
                    <p className="text-xs font-bold text-slate-500 mb-3">📊 내 현재 성적 요약</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-xl p-3 text-center border border-cyan-100">
                        <p className="text-[10px] text-slate-400 font-bold">총 득점</p>
                        <p className="text-xl font-black text-cyan-600 mt-0.5">
                          {myAnswerHistory.reduce((s, h) => s + h.score, 0)}
                          <span className="text-xs font-bold text-slate-400">점</span>
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center border border-emerald-100">
                        <p className="text-[10px] text-slate-400 font-bold">정답 수</p>
                        <p className="text-xl font-black text-emerald-600 mt-0.5">
                          {myAnswerHistory.filter(h => h.isCorrect).length}
                          <span className="text-xs font-bold text-slate-400">/{myAnswerHistory.length}</span>
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold">총 풀이</p>
                        <p className="text-xl font-black text-slate-600 mt-0.5">
                          {myAnswerHistory.reduce((s, h) => s + h.timeTaken, 0)}
                          <span className="text-xs font-bold text-slate-400">초</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <p className="text-xs font-bold text-slate-500 mb-3">📝 문제별 응답 내역</p>
                    <div className="flex flex-wrap gap-2">
                      {myAnswerHistory.map((h) => (
                        <div key={h.quizId} className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-bold ${h.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${h.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {h.quizNum}
                          </span>
                          <span>{h.isCorrect ? '⭕' : '❌'}</span>
                          <span className="text-[10px] font-semibold opacity-70">{h.timeTaken}초</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })()}

        {/* ======================================= */}
        {/* VIEW 7: PART 2 RESULT & RANKING          */}
        {/* ======================================= */}
        {currentView === 'part2-result' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
                  <Award className="w-6 h-6 text-cyan-500" />
                  <span>실시간 수료평가 리더보드</span>
                </h3>
                <p className="text-slate-500 text-sm mt-1">풀이 점수 가중치와 완료 스피드를 종합하여 최종 Top 5를 선정합니다.</p>
              </div>
              <button 
                onClick={() => setCurrentView('main')}
                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold py-2 px-4 rounded-lg text-sm transition-all"
              >
                홈으로
              </button>
            </div>

            {quizResponses.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="font-semibold text-lg">아직 수집된 퀴즈 참여 내역이 없습니다.</p>
                <p className="text-sm text-slate-400 mt-1">참여자들이 퀴즈 정답을 제출하면 리더보드가 실시간 개방됩니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 왼쪽: 영광의 Top 5 시각화 보드 */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-base font-bold text-slate-700 mb-6 flex items-center space-x-1.5 border-b pb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span>영광의 명예의 전당 (Top 5)</span>
                  </h4>

                  <div className="space-y-4">
                    {calculateLeaderboard().map((user, idx) => (
                      <div key={user.nickname} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm
                            ${idx === 0 ? 'bg-yellow-400 text-white shadow' : idx === 1 ? 'bg-slate-300 text-white' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            {idx + 1}위
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-base">{user.nickname}</span>
                            <span className="text-xs text-slate-400 block">푼 문제 수: {user.correctCount}개</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black text-cyan-600">{user.totalScore}점</span>
                          <span className="text-[10px] text-slate-400 block">소요 시간합: {user.totalTime}초</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 오른쪽: 각 퀴즈별 오답/정답 비율 분포 대시보드 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-base font-bold text-slate-700 mb-4 border-b pb-2">문제별 결과 분석 지표</h4>
                  <div className="space-y-5 max-h-[450px] overflow-y-auto pr-2">
                    {quizList.map(q => {
                      const responsesForQ = quizResponses.filter(r => Number(r.quiz_id) === Number(q.id));
                      const correctCount = responsesForQ.filter(r => r.is_correct).length;
                      const totalCount = responsesForQ.length;
                      const correctRate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

                      return (
                        <div key={q.id} className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>Q{q.id}. {q.question.slice(0, 18)}...</span>
                            <span className="text-emerald-600">{correctRate}% 정답률</span>
                          </div>
                          
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                              style={{ width: `${correctRate}%` }}
                            />
                          </div>
                          
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>제출수: {totalCount}표</span>
                            <span>정답: {q.answer}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 8: ADMIN LOGIN                     */}
        {/* ======================================= */}
        {currentView === 'admin-login' && (
          <div className="max-w-sm mx-auto w-full bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="text-center mb-6">
              <LogIn className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-slate-800">워크숍 통합 관리자 인증</h3>
              <p className="text-xs text-slate-400 mt-1">시스템 세팅 조정을 위한 액세스 잠금</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">관리자 패스워드</label>
                <input 
                  type="password" 
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full border border-slate-200 focus:border-slate-800 outline-none rounded-xl px-4 py-3 text-base transition-all"
                />
                {adminError && <p className="text-xs text-rose-500 font-bold mt-1">{adminError}</p>}
              </div>

              <button 
                onClick={handleAdminLogin}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl transition-all"
              >
                대시보드 로그인
              </button>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 9: ADMIN DASHBOARD (통제소)         */}
        {/* ======================================= */}
        {currentView === 'admin-dashboard' && (
          <div className="space-y-8">
            
            {/* 어드민 상단부 */}
            <div className="bg-slate-800 text-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-black flex items-center space-x-2">
                  <Settings className="w-6 h-6 text-emerald-400" />
                  <span>2026 워크샵 통합 컨트롤 타워</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">설문 데이터 무력화, 퀴즈 출제 기제 및 실시간 추첨 제어가 가능합니다.</p>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button 
                  onClick={() => setCurrentView('main')}
                  className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all"
                >
                  어드민 로그아웃
                </button>
              </div>
            </div>

            {/* ========================================== */}
            {/* PART 1. 조직개선 설문조사 통제 섹션          */}
            {/* ========================================== */}
            <div className="space-y-4">
              <h4 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2 border-b border-slate-200 pb-2">
                <Users className="w-5 h-5 text-emerald-500" />
                <span>PART 1. 조직개선 설문조사 통제</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* AI 분석 리포트 생성 및 제어 */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h5 className="font-bold text-emerald-800 flex items-center space-x-1.5 text-sm">
                    <Sparkles className="w-4.5 h-4.5 text-emerald-600" />
                    <span>조직문화 AI 분석 리포트 생성 및 제어</span>
                  </h5>
                  <p className="text-xs text-emerald-600">수집된 설문 데이터를 바탕으로 AI(Gemini)에 분석 보고서 생성을 요청합니다.</p>

                  {/* 수동 분석 버튼 */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 mb-1.5">🖐 수동 분석</p>
                    <button
                      onClick={requestAiAnalysis}
                      disabled={surveyResults.length === 0 || isAiAnalyzing}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-sm hover:brightness-105 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      {isAiAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>{isAiAnalyzing ? "AI 분석가 가동 중..." : "AI 결과 종합 분석 요청"}</span>
                    </button>
                  </div>

                  {/* 자동 분석 설정 */}
                  <div className="border-t border-emerald-200 pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-500">🤖 자동 분석</p>
                      <button
                        onClick={() => setAutoAnalysisEnabled(prev => !prev)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoAnalysisEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${autoAnalysisEnabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    {autoAnalysisEnabled && (
                      <div className="bg-white border border-emerald-100 rounded-lg p-3 space-y-2">
                        <p className="text-[10px] text-slate-500 font-semibold">N명 제출마다 자동 분석 실행</p>
                        <div className="flex items-center space-x-2">
                          {[1, 3, 5, 10].map(n => (
                            <button
                              key={n}
                              onClick={() => setAutoAnalysisInterval(n)}
                              className={`flex-1 text-[11px] font-bold py-1 rounded-md transition-all ${autoAnalysisInterval === n ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                              {n}명
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          현재: {autoAnalysisInterval}명 제출마다 자동 분석<br/>
                          예상 월 호출: 약 {Math.ceil(500 / autoAnalysisInterval)}회
                          {Math.ceil(500 / autoAnalysisInterval) > 250
                            ? <span className="text-rose-500 font-bold"> ⚠️ 일일 한도 주의</span>
                            : <span className="text-emerald-600 font-bold"> ✅ 무료 한도 내</span>
                          }
                        </p>
                      </div>
                    )}
                    {!autoAnalysisEnabled && (
                      <p className="text-[10px] text-slate-400 bg-white rounded-lg p-2 border border-slate-100">자동 분석 꺼짐 — 수동 버튼으로만 분석합니다.</p>
                    )}
                  </div>
                </div>

                {/* 설문 데이터 엑셀 다운로드 */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-4">
                  <h5 className="font-bold text-emerald-800 flex items-center space-x-1.5 text-sm">
                    <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600" />
                    <span>설문 데이터 엑셀 다운로드</span>
                  </h5>
                  <p className="text-xs text-emerald-600/80">현재까지 수집된 모든 설문 데이터(만족도, 밸런스게임, VOC)를 엑셀 파일(.xlsx)로 다운로드합니다.</p>
                  <div className="pt-2">
                    <button
                      onClick={handleDownloadExcel}
                      disabled={surveyResults.length === 0}
                      className="w-full bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-extrabold py-2.5 px-4 rounded-lg shadow-xs transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>엑셀 다운로드 (.xlsx)</span>
                    </button>
                  </div>
                </div>

                {/* 파트 1 데이터 초기화 */}
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6 shadow-sm space-y-4">
                  <h5 className="font-bold text-rose-800 flex items-center space-x-1.5 text-sm">
                    <Trash2 className="w-4.5 h-4.5 text-rose-600" />
                    <span>파트 1 설문 데이터 초기화</span>
                  </h5>
                  <p className="text-xs text-rose-600/80">수집된 설문조사 및 작성된 AI 보고서 데이터를 완전히 리셋합니다.</p>
                  <div className="pt-2">
                    <button
                      onClick={resetPart1Data}
                      className="w-full bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-extrabold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>파트 1 설문 & AI 리포트 초기화</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================== */}

            {/* PART 2. 워크숍 수료 평가 퀴즈 통제 섹션 — 3열 레이아웃 */}
            {/* ========================================== */}
            <div className="space-y-4 pt-4">
              <div className="border-b border-slate-200 pb-2">
                <h4 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5 text-cyan-500" />
                  <span>PART 2. 워크숍 수료 평가 퀴즈 통제</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 좌측: 퀴즈 문제 은행 편집 보드 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 border-b pb-3 mb-4">
                      <Edit2 className="w-4 h-4 text-cyan-500" />
                      <h5 className="font-bold text-slate-800 text-sm">퀴즈 문제 은행 편집 보드</h5>
                    </div>

                    {/* 문제 유형별 통계 */}
                    {(() => {
                      const choiceCnt = quizList.filter(q => q.type === 'choice').length;
                      const oxCnt = quizList.filter(q => q.type === 'ox').length;
                      const shortCnt = quizList.filter(q => q.type === 'short').length;
                      const total = quizList.length;
                      return (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-3 text-center">
                              <p className="text-[10px] text-cyan-600 font-bold">객관식</p>
                              <p className="text-2xl font-black text-cyan-700">{choiceCnt}</p>
                              <p className="text-[10px] text-cyan-500">문제</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                              <p className="text-[10px] text-emerald-600 font-bold">OX 퀴즈</p>
                              <p className="text-2xl font-black text-emerald-700">{oxCnt}</p>
                              <p className="text-[10px] text-emerald-500">문제</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                              <p className="text-[10px] text-amber-600 font-bold">주관식</p>
                              <p className="text-2xl font-black text-amber-700">{shortCnt}</p>
                              <p className="text-[10px] text-amber-500">문제</p>
                            </div>
                            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-center">
                              <p className="text-[10px] text-slate-500 font-bold">총 문제 수</p>
                              <p className="text-2xl font-black text-slate-700">{total}</p>
                              <p className="text-[10px] text-slate-400">문제</p>
                            </div>
                          </div>

                          {total === 0 && (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                              <p className="text-xs text-slate-400">등록된 퀴즈가 없습니다.</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* 편집 보드 열기 버튼 */}
                  <button
                    onClick={() => setIsQuizBankModalOpen(true)}
                    className="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>문제 편집 보드 열기</span>
                  </button>
                </div>

                {/* 가운데: 실시간 라이브 퀴즈 버튼 */}
                <div className="bg-gradient-to-b from-cyan-50 to-slate-50 border border-cyan-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center space-y-5">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    <h5 className="font-extrabold text-slate-800 text-base">실시간 라이브 퀴즈</h5>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      퀴즈 송출 패널과 즉석 추첨기를<br/>팝업 화면에서 통합 제어합니다.
                    </p>
                  </div>

                  {/* 실시간 현황 미리보기 */}
                  {(() => {
                    const activeQuiz = quizList.find(q => q.id === currentAdminQuizId) || quizList[0];
                    const totalResp = activeQuiz ? quizResponses.filter(r => Number(r.quiz_id) === Number(activeQuiz?.id)).length : 0;
                    return activeQuiz ? (
                      <div className="w-full bg-white border border-cyan-100 rounded-xl px-4 py-3 text-center space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold">현재 송출 중</p>
                        <p className="text-xs font-extrabold text-slate-700 truncate">Q{activeQuiz.id}. {activeQuiz.question.slice(0, 20)}...</p>
                        <div className="flex items-center justify-center space-x-1.5 pt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="text-xs font-bold text-cyan-600">{totalResp}명 제출 완료</span>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  <button
                    onClick={() => setIsLiveQuizModalOpen(true)}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
                  >
                    <Play className="w-4 h-4" />
                    <span>실시간 라이브 퀴즈 열기</span>
                  </button>
                </div>

                {/* 우측: 데이터 초기화 */}
                <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-rose-800 flex items-center space-x-1.5 text-sm border-b border-rose-100 pb-3">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>파트 2 데이터 초기화</span>
                    </h5>
                    <div className="mt-4 space-y-3">
                      <div className="bg-white border border-rose-100 rounded-xl p-3 text-xs text-slate-500 space-y-1">
                        <p className="font-bold text-slate-700">⚠️ 초기화 시 삭제 항목</p>
                        <p>• 전체 퀴즈 참여자 응답 데이터</p>
                        <p>• 점수 및 랭킹 정보</p>
                        <p>• 추첨 결과 기록</p>
                        <p className="text-rose-500 font-bold pt-1">* 퀴즈 문제 목록은 유지됩니다.</p>
                      </div>
                      <div className="bg-white border border-slate-100 rounded-xl p-3 text-xs space-y-1">
                        <p className="text-slate-500 font-bold">📊 현재 데이터 현황</p>
                        <p className="text-slate-700">총 응답 수: <span className="font-black text-cyan-600">{quizResponses.length}건</span></p>
                        <p className="text-slate-700">참여자 수: <span className="font-black text-cyan-600">{[...new Set(quizResponses.map(r => r.nickname))].filter(Boolean).length}명</span></p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={resetPart2Data}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-1.5 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>파트 2 퀴즈 & 랭킹 초기화</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
      )}
      {/* ================================================ */}
      {isLiveQuizModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-3">
          <div className="bg-slate-50 rounded-2xl shadow-2xl w-full h-full max-w-[98vw] max-h-[96vh] flex flex-col overflow-hidden">

            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">실시간 라이브 퀴즈 통제 센터</h3>
                  <p className="text-[10px] text-slate-400">송출 패널 · 추첨기 통합 운영</p>
                </div>
              </div>
              <button
                onClick={() => setIsLiveQuizModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 모달 바디: 2열 분할 */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full">

                {/* 좌측: 실시간 라이브 퀴즈 송출 패널 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="font-bold text-slate-800 text-base flex items-center space-x-1.5">
                      <Play className="w-5 h-5 text-cyan-500" />
                      <span>실시간 라이브 퀴즈 송출 패널</span>
                    </h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={async () => {
                          const { data } = await supabase.from('quiz_responses').select('*').order('timestamp', { ascending: true });
                          if (data) {
                            const normalized = data.map(row => ({
                              ...row,
                              quiz_id: Number(row.quiz_id),
                              is_correct: row.is_correct === true || row.is_correct === 'true',
                              score_gained: Number(row.score_gained || 0),
                              time_taken: Number(row.time_taken || 0),
                            }));
                            setQuizResponses(normalized);
                          }
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded flex items-center space-x-1 transition-all"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>새로고침</span>
                      </button>
                      <span className="bg-cyan-50 text-cyan-600 text-xs font-black px-2.5 py-1 rounded">LIVE CONTROL</span>
                    </div>
                  </div>

                  {/* 세션 시작/중단 버튼 */}
                  <div className={`rounded-xl p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    quizActive
                      ? 'bg-cyan-50 border-cyan-200'
                      : quizSessionActive
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          quizActive ? 'bg-cyan-400 animate-pulse' :
                          quizSessionActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'
                        }`} />
                        <span className={`text-xs font-black ${
                          quizActive ? 'text-cyan-700' :
                          quizSessionActive ? 'text-emerald-700' : 'text-slate-500'
                        }`}>
                          {quizActive ? '📡 문제 송출 중' :
                           quizSessionActive ? '✅ 수료평가 세션 진행 중' : '⏳ 수료평가 세션 대기 중'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 ml-4">
                        {quizActive
                          ? '참여자들이 문제를 풀고 있습니다. 정답 공개 후 다음 문제를 송출하세요.'
                          : quizSessionActive
                            ? '참여자들이 수료평가 준비 상태입니다. 아래에서 문제를 송출하세요.'
                            : '참여자들이 수료평가 대기 상태입니다. 시작 버튼으로 세션을 활성화하세요.'}
                      </p>
                    </div>
                    <div className="flex space-x-2 w-full sm:w-auto shrink-0">
                      {!quizSessionActive ? (
                        <button
                          onClick={() => {
                            if (window.confirm('수료평가를 시작하시겠습니까?\n참여자들이 \'수료평가 준비\' 상태로 변경됩니다.')) {
                              startQuizSession();
                            }
                          }}
                          className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>시작</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (window.confirm('수료평가를 중단하시겠습니까?\n참여자들이 \'수료평가 대기\' 상태로 변경됩니다.')) {
                              stopQuizSession();
                            }
                          }}
                          className="flex-1 sm:flex-none bg-rose-500 hover:bg-rose-600 text-white text-xs font-black px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>중단</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 현재 활성 퀴즈 정보 */}
                  {(() => {
                    const activeQuiz = quizList.find(q => q.id === currentAdminQuizId) || quizList[0];
                    if (!activeQuiz) return <p className="text-slate-400 text-xs">등록된 퀴즈가 없습니다.</p>;

                    // 닉네임 기준 중복 제거 (같은 사람이 여러 번 제출한 경우 최신 응답만 사용)
                    const allForQ = quizResponses.filter(r => Number(r.quiz_id) === Number(activeQuiz.id));
                    const deduped = Object.values(
                      allForQ.reduce((acc, r) => {
                        acc[r.nickname] = r;
                        return acc;
                      }, {})
                    ).filter(r => r.submitted_answer !== '시간 초과');
                    const responsesForQ = deduped;
                    const totalResponses = responsesForQ.length;
                    const correctCount = responsesForQ.filter(r => r.is_correct === true).length;
                    const incorrectCount = totalResponses - correctCount;
                    const correctRate = totalResponses > 0 ? Math.round((correctCount / totalResponses) * 100) : 0;
                    const incorrectRate = totalResponses > 0 ? 100 - correctRate : 0;

                    return (
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-4">

                        {/* 문제 정보 + 카운트다운 — 송출 개시 후에만 표시 */}
                        {quizActive ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="bg-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">현재 전송 중</span>
                              {/* 카운트다운 타이머 */}
                              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-black text-sm transition-all ${
                                adminTimer <= 3
                                  ? 'bg-rose-500 text-white animate-pulse'
                                  : adminTimer <= 5
                                    ? 'bg-amber-400 text-white'
                                    : 'bg-slate-200 text-slate-700'
                              }`}>
                                <span className="text-[10px] font-bold opacity-80">제한시간</span>
                                <span className="text-xl font-black tabular-nums">{adminTimer}</span>
                              </div>
                            </div>
                            <h5 className="font-extrabold text-slate-800 text-xl mt-2 leading-snug">
                              Q{activeQuiz.id}. {activeQuiz.question}
                            </h5>

                            {/* 카운트다운 게이지 바 */}
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  adminTimer <= 3 ? 'bg-rose-500' :
                                  adminTimer <= 5 ? 'bg-amber-400' : 'bg-cyan-500'
                                }`}
                                style={{ width: `${(adminTimer / 10) * 100}%` }}
                              />
                            </div>

                            {/* 정답 공개 후에만 정답 크게 표시 */}
                            {adminShowAnswer && (
                              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl px-5 py-4 flex items-center space-x-3">
                                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                                <div>
                                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">정답</p>
                                  <p className="text-2xl font-black text-emerald-700 mt-0.5">{activeQuiz.answer}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* 송출 개시 전 — 문제 숨김 */
                          <div className="flex items-center space-x-3 py-2">
                            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center shrink-0">
                              <HelpCircle className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-500">문제 대기 중</p>
                              <p className="text-[10px] text-slate-400">
                                아래 <span className="font-bold text-cyan-600">송출 개시</span> 버튼을 클릭하면 참여자 화면에 문제가 공개됩니다.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 접속 중인 참여자 수 카드 */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-xs font-bold text-slate-600">접속 대기 인원</span>
                            </div>
                            <div className="flex items-baseline space-x-1">
                              <span className="text-2xl font-black text-emerald-600">{waitingParticipants.length}</span>
                              <span className="text-xs text-slate-400 font-bold">명</span>
                            </div>
                          </div>
                          {/* 실시간 제출 완료인원 카운터 */}
                          <div className="bg-white border border-cyan-200 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                              <span className="text-xs font-bold text-slate-600">제출 완료인원</span>
                            </div>
                            <div className="flex items-baseline space-x-1">
                              <span className="text-2xl font-black text-cyan-600">{totalResponses}</span>
                              <span className="text-xs text-slate-400 font-bold">명</span>
                            </div>
                          </div>
                        </div>

                        {/* 대기열 참여자 목록 (펼쳐보기) */}
                        {waitingParticipants.length > 0 && (
                          <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 space-y-2">
                            <p className="text-[10px] font-bold text-slate-500">접속 중인 참여자 ({waitingParticipants.length}명)</p>
                            <div className="flex flex-wrap gap-1.5">
                              {waitingParticipants.map((p, i) => (
                                <span key={p.id || i} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {p.nickname}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 정답 공개 전: 제출 현황만 표시 / 공개 후: 정답·오답 비율 */}
                        {!adminShowAnswer ? (
                          totalResponses > 0 && (
                            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                              <p className="text-[11px] font-bold text-slate-400">제출 현황 (정답 공개 전)</p>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '100%' }} />
                                </div>
                                <span className="text-xs font-bold text-cyan-600 w-10 text-right">{totalResponses}명</span>
                              </div>
                              <p className="text-[10px] text-slate-400">※ 정답/오답 비율은 정답 공개 후 표시됩니다.</p>
                            </div>
                          )
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                            <p className="text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              <span>정답 공개 후 최종 결과</span>
                            </p>

                            {/* 객관식: 보기별 응답 수/비율 */}
                            {activeQuiz.type === 'choice' && (() => {
                              const COLORS = ['bg-cyan-500','bg-emerald-500','bg-amber-500','bg-violet-500'];
                              const LIGHT = ['bg-cyan-50 border-cyan-100 text-cyan-700','bg-emerald-50 border-emerald-100 text-emerald-700','bg-amber-50 border-amber-100 text-amber-700','bg-violet-50 border-violet-100 text-violet-700'];
                              return (
                                <div className="space-y-2">
                                  {(activeQuiz.options || []).map((opt, i) => {
                                    const cnt = responsesForQ.filter(r => r.submitted_answer === opt).length;
                                    const pct = totalResponses > 0 ? Math.round(cnt / totalResponses * 100) : 0;
                                    const isAnswer = opt === activeQuiz.answer;
                                    return (
                                      <div key={i} className={`border rounded-xl p-2.5 ${isAnswer ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center space-x-1.5">
                                            {isAnswer && <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />}
                                            <span className={`text-xs font-bold ${isAnswer ? 'text-emerald-700' : 'text-slate-600'}`}>{opt}</span>
                                          </div>
                                          <div className="flex items-center space-x-1.5">
                                            <span className={`text-xs font-black ${isAnswer ? 'text-emerald-700' : 'text-slate-600'}`}>{cnt}명</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isAnswer ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>{pct}%</span>
                                          </div>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full transition-all duration-700 ${isAnswer ? 'bg-emerald-500' : COLORS[i % COLORS.length]}`} style={{ width: `${pct}%` }} />
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <p className="text-[10px] text-slate-400 text-center pt-1">총 {totalResponses}명 제출 · 정답률 {correctRate}%</p>
                                </div>
                              );
                            })()}

                            {/* OX: O/X 응답 수/비율 */}
                            {activeQuiz.type === 'ox' && (() => {
                              const oCnt = responsesForQ.filter(r => r.submitted_answer === 'O').length;
                              const xCnt = responsesForQ.filter(r => r.submitted_answer === 'X').length;
                              const oPct = totalResponses > 0 ? Math.round(oCnt / totalResponses * 100) : 0;
                              const xPct = totalResponses > 0 ? Math.round(xCnt / totalResponses * 100) : 0;
                              return (
                                <div className="space-y-2">
                                  {[{label:'O', cnt:oCnt, pct:oPct, isAnswer: activeQuiz.answer==='O', color:'bg-emerald-500', light:'bg-emerald-50 border-emerald-300 text-emerald-700'},
                                    {label:'X', cnt:xCnt, pct:xPct, isAnswer: activeQuiz.answer==='X', color:'bg-rose-500', light:'bg-rose-50 border-rose-300 text-rose-700'}
                                  ].map(item => (
                                    <div key={item.label} className={`border rounded-xl p-3 ${item.isAnswer ? item.light : 'bg-slate-50 border-slate-200'}`}>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center space-x-1.5">
                                          {item.isAnswer && <CheckCircle className="w-3.5 h-3.5 text-current shrink-0" />}
                                          <span className="text-xl font-black">{item.label}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm font-black">{item.cnt}명</span>
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.isAnswer ? 'bg-white/60' : 'bg-slate-200 text-slate-500'}`}>{item.pct}%</span>
                                        </div>
                                      </div>
                                      <div className="w-full bg-white/60 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-700 ${item.color}`} style={{ width: `${item.pct}%` }} />
                                      </div>
                                    </div>
                                  ))}
                                  <p className="text-[10px] text-slate-400 text-center pt-1">총 {totalResponses}명 제출 · 정답률 {correctRate}%</p>
                                </div>
                              );
                            })()}

                            {/* 주관식: 상위 3개 응답 */}
                            {activeQuiz.type === 'short' && (() => {
                              const answerMap = {};
                              responsesForQ.forEach(r => {
                                const a = (r.submitted_answer || '').trim();
                                if (a) answerMap[a] = (answerMap[a] || 0) + 1;
                              });
                              const sorted = Object.entries(answerMap)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3);
                              return (
                                <div className="space-y-2">
                                  <p className="text-[10px] font-bold text-slate-400">상위 응답 TOP 3</p>
                                  {sorted.length === 0 && <p className="text-xs text-slate-400">제출된 응답이 없습니다.</p>}
                                  {sorted.map(([ans, cnt], i) => {
                                    const pct = totalResponses > 0 ? Math.round(cnt / totalResponses * 100) : 0;
                                    const isAnswer = ans.trim().toLowerCase() === activeQuiz.answer.trim().toLowerCase();
                                    const RANK_COLOR = ['text-amber-500','text-slate-400','text-amber-700'];
                                    const RANK_LABEL = ['🥇','🥈','🥉'];
                                    return (
                                      <div key={i} className={`border rounded-xl p-2.5 ${isAnswer ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center space-x-1.5">
                                            <span className="text-sm">{RANK_LABEL[i]}</span>
                                            {isAnswer && <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />}
                                            <span className={`text-xs font-bold ${isAnswer ? 'text-emerald-700' : 'text-slate-600'}`}>"{ans}"</span>
                                          </div>
                                          <div className="flex items-center space-x-1.5">
                                            <span className={`text-xs font-black ${isAnswer ? 'text-emerald-700' : 'text-slate-600'}`}>{cnt}명</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isAnswer ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>{pct}%</span>
                                          </div>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full transition-all duration-700 ${isAnswer ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <p className="text-[10px] text-slate-400 text-center pt-1">총 {totalResponses}명 제출 · 정답률 {correctRate}%</p>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* 정답 공개 버튼 */}
                        <div className="pt-1">
                          <button
                            onClick={() => {
                              const nextAnswerState = !adminShowAnswer;
                              const confirmMsg = nextAnswerState
                                ? "정말 정답을 공개하시겠습니까?"
                                : "정답을 다시 숨기시겠습니까?";
                              if (window.confirm(confirmMsg)) {
                                updateAdminStatus(currentAdminQuizId, nextAnswerState);
                              }
                            }}
                            className={`text-xs font-bold py-2 px-3.5 rounded-lg shadow-xs transition-all flex items-center space-x-1
                              ${adminShowAnswer ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{adminShowAnswer ? "정답 다시 숨기기" : "정답 전면 공개하기"}</span>
                          </button>
                        </div>

                      </div>
                    );
                  })()}

                  {/* 퀴즈 송출 제어 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-500">원격 송출 문제 선택</label>
                      {quizActive && (
                        <button
                          onClick={() => {
                            if (window.confirm('송출을 중단하시겠습니까?\n참여자들이 수료평가 준비 상태로 복귀합니다.')) {
                              stopBroadcast();
                            }
                          }}
                          className="text-[10px] font-bold bg-rose-100 hover:bg-rose-200 text-rose-600 px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all"
                        >
                          <X className="w-3 h-3" />
                          <span>송출 중단</span>
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {quizList.map(q => {
                        const isCurrent = currentAdminQuizId === q.id;
                        const isLive = isCurrent && quizActive;
                        return (
                          <button
                            key={q.id}
                            onClick={() => {
                              if (!quizSessionActive) {
                                triggerAlert('세션 미시작', '먼저 수료평가 세션을 시작해주세요.');
                                return;
                              }
                              const msg = isLive
                                ? `Q${q.id} 문제가 이미 송출 중입니다.`
                                : `Q${q.id} 번 문제를 참여자들에게 송출하시겠습니까?`;
                              if (!isLive && window.confirm(msg)) {
                                broadcastQuiz(q.id);
                              }
                            }}
                            className={`py-2 px-3 text-xs font-black rounded-lg border text-left transition-all flex items-center space-x-1
                              ${isLive
                                ? 'bg-cyan-500 border-cyan-500 text-white shadow-sm animate-pulse'
                                : isCurrent
                                  ? 'bg-cyan-100 border-cyan-300 text-cyan-700'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
                          >
                            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1" />}
                            <span>Q{q.id} {isLive ? '송출 중' : '송출 개시'}</span>
                          </button>
                        );
                      })}
                    </div>
                    {!quizSessionActive && (
                      <p className="text-[10px] text-slate-400 mt-2">⚠️ 세션을 먼저 시작해야 문제를 송출할 수 있습니다.</p>
                    )}
                  </div>
                </div>

                {/* 우측: 정답자 실시간 즉석 추첨기 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="border-b pb-3">
                    <h4 className="font-bold text-slate-800 text-base flex items-center space-x-1.5">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span>정답자 실시간 즉석 추첨기</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">실시간 퀴즈 정답자들을 대상으로 한 즉석 기프티콘 추첨 모듈입니다.</p>
                  </div>

                  {/* 현재 문제 정답자 현황 */}
                  {(() => {
                    const activeQuiz = quizList.find(q => q.id === currentAdminQuizId) || quizList[0];
                    const allForQ = activeQuiz
                      ? quizResponses.filter(r => Number(r.quiz_id) === Number(activeQuiz?.id))
                      : [];
                    const responsesForQ = Object.values(
                      allForQ.reduce((acc, r) => {
                        acc[r.nickname] = r;
                        return acc;
                      }, {})
                    ).filter(r => r.submitted_answer !== '시간 초과');
                    const correctList = responsesForQ.filter(r => r.is_correct === true);
                    const totalCount = responsesForQ.length;
                    const correctRate = totalCount > 0 ? Math.round((correctList.length / totalCount) * 100) : 0;

                    return !adminShowAnswer ? (
                      /* 정답 공개 전 — 정답자 숨김 */
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-bold text-slate-600">현재 문제 정답자 현황</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                            <span className="text-slate-400 text-sm">🔒</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-500">정답 공개 전</p>
                            <p className="text-[10px] text-slate-400">총 {totalCount}명 제출 완료 · 정답자는 공개 후 표시됩니다.</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 정답 공개 후 — 정답자 수 + 비율 + 닉네임 표시 */
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-bold text-emerald-700">현재 문제 정답자 현황</p>

                        {/* 정답자/오답자 카드 */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white border border-emerald-100 rounded-lg p-2.5 text-center">
                            <p className="text-[10px] text-emerald-600 font-bold">정답자</p>
                            <p className="text-xl font-black text-emerald-700">{correctList.length}명</p>
                            <p className="text-[10px] text-emerald-500 font-bold">{correctRate}%</p>
                          </div>
                          <div className="bg-white border border-rose-100 rounded-lg p-2.5 text-center">
                            <p className="text-[10px] text-rose-600 font-bold">오답자</p>
                            <p className="text-xl font-black text-rose-700">{totalCount - correctList.length}명</p>
                            <p className="text-[10px] text-rose-500 font-bold">{totalCount > 0 ? 100 - correctRate : 0}%</p>
                          </div>
                        </div>

                        {/* 정답률 바 */}
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                          <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${correctRate}%` }} />
                          <div className="h-full bg-rose-400 transition-all duration-700" style={{ width: `${totalCount > 0 ? 100 - correctRate : 0}%` }} />
                        </div>

                        {/* 정답자 닉네임 목록 */}
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {correctList.length === 0 ? (
                            <p className="text-xs text-slate-400">정답자가 없습니다.</p>
                          ) : (
                            correctList.map((r, i) => (
                              <span key={i} className="bg-white border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {r.nickname}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-slate-500 space-y-1.5">
                    <p className="font-bold text-slate-700">📌 추첨 안내</p>
                    <p>• 현재 송출된 퀴즈의 정답자 명단을 추출하여 추첨 팝업 창을 엽니다.</p>
                    <p>• 팝업 창 내에서 룰렛/사다리 배정 및 추첨을 제어할 수 있습니다.</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsRaffleModalOpen(true);
                      setIsRaffleAssigned(false);
                      setDrawWinner(null);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Award className="w-5 h-5" />
                    <span>추첨기 팝업 호출하기</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-6 px-4 mt-12 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 구매계약실 상반기 워크숍 운영위원회. All rights reserved.</p>
          <div className="flex space-x-3">
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">배경 스타일: 라이트 모드 (화사한 톤)</span>
          </div>
        </div>
      </footer>

      {/* GLOBAL POPUP ALERT MODAL */}
      {alertConfig.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-extrabold text-slate-800 text-lg">{alertConfig.title}</h4>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{alertConfig.message}</p>
            <button
              onClick={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
              className="mt-5 w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-all"
            >
              확인하였습니다
            </button>
          </div>
        </div>
      )}

      {/* REAL-TIME RAFFLE POPUP MODAL (ADMIN ONLY) */}
      {isRaffleModalOpen && (() => {
        const currentQuiz = quizList.find(q => q.id === currentAdminQuizId) || quizList[0];
        const allForQ = quizResponses.filter(r => Number(r.quiz_id) === Number(currentQuiz?.id));
        const responsesForQ = Object.values(
          allForQ.reduce((acc, r) => {
            acc[r.nickname] = r;
            return acc;
          }, {})
        ).filter(r => r.submitted_answer !== '시간 초과');
        const correctResponses = responsesForQ.filter(r => r.is_correct === true);
        const correctCount = correctResponses.length;
        const incorrectCount = responsesForQ.length - correctCount;
        const totalCount = responsesForQ.length;
        const correctRate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
        const incorrectRate = totalCount > 0 ? 100 - correctRate : 0;

        return (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-8 space-y-6 shadow-2xl my-8">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-black text-slate-800 text-xl flex items-center space-x-2">
                  <Award className="w-7 h-7 text-yellow-500 fill-yellow-500" />
                  <span>실시간 즉석 추첨기 (문제 {currentQuiz?.id})</span>
                </h4>
                <button 
                  onClick={() => setIsRaffleModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 1. 정답자/오답자 수와 비율 표시 */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-700 font-bold text-sm">
                  <span>총 제출 현황: {totalCount}명</span>
                  <span className="text-cyan-600">Q{currentQuiz?.id} 문제</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-center">
                    <p className="text-emerald-700 font-bold mb-1">정답자</p>
                    <p className="text-xl font-black text-emerald-800">{correctCount}명 ({correctRate}%)</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 text-center">
                    <p className="text-rose-700 font-bold mb-1">오답자</p>
                    <p className="text-xl font-black text-rose-800">{incorrectCount}명 ({incorrectRate}%)</p>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500" style={{ width: `${correctRate}%` }} />
                  <div className="h-full bg-rose-400" style={{ width: `${incorrectRate}%` }} />
                </div>
              </div>

              {/* 추첨 방식 결정 */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">추첨 방식</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setDrawMethod('roulette');
                      setIsRaffleAssigned(false);
                      setDrawWinner(null);
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all
                      ${drawMethod === 'roulette' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600'}`}
                  >
                    룰렛 회전판
                  </button>
                  <button
                    onClick={() => {
                      setDrawMethod('ladder');
                      setIsRaffleAssigned(false);
                      setDrawWinner(null);
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all
                      ${drawMethod === 'ladder' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600'}`}
                  >
                    사다리 시뮬레이션
                  </button>
                </div>
              </div>

              {/* 추첨판 시각화 영역 */}
              <div className="bg-slate-50 rounded-xl p-6 flex flex-col items-center justify-center min-h-[350px] border border-slate-100 relative overflow-hidden">
                {!isRaffleAssigned ? (
                  <div className="w-full space-y-4">
                    <div className="text-center space-y-1">
                      <Users className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="font-bold text-base text-slate-500">추첨 대상자 명단</p>
                      <p className="text-xs text-slate-400">하단 '즉석 기프티콘 추첨 시작' 버튼을 눌러 추첨판을 배정해주세요.</p>
                    </div>
                    {correctResponses.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-xs text-slate-400 font-semibold">아직 정답자가 없습니다.</p>
                      </div>
                    ) : (
                      <div className="bg-white border border-emerald-100 rounded-xl p-4 space-y-2">
                        <p className="text-[11px] font-bold text-emerald-600 mb-2">
                          ✅ 정답자 {correctResponses.length}명
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {correctResponses.map((r, idx) => (
                            <div key={idx} className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                              <span className="w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">{idx + 1}</span>
                              <span className="text-xs font-bold text-emerald-700">{r.nickname}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : drawMethod === 'roulette' ? (
                  <RouletteWheel
                    participants={correctResponses}
                    canvasRef={rouletteCanvasRef}
                    angleRef={rouletteAngleRef}
                    drawFn={drawRouletteWheel}
                  />
                ) : (
                  <LadderGame
                    participants={correctResponses}
                    isDrawing={isDrawing && drawMethod === 'ladder'}
                    onWinner={(winner) => {
                      setDrawWinner(winner);
                      setIsDrawing(false);
                      if (soundEnabled) playSound('success');
                    }}
                  />
                )}

                {isDrawing && drawMethod !== 'ladder' && (
                  <div className="absolute inset-0 bg-slate-900/40 text-white flex items-center justify-center font-black animate-pulse text-sm">
                    추첨 진행 중...
                  </div>
                )}

                {drawWinner && (
                  <div className="absolute inset-0 bg-emerald-500 text-white flex flex-col items-center justify-center p-4 text-center z-20">
                    <Award className="w-12 h-12 text-yellow-300 mb-1" />
                    <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded">당첨을 축하드립니다!</span>
                    <h5 className="font-extrabold text-xl mt-1">{drawWinner.nickname}</h5>
                    <p className="text-[10px] opacity-80 mt-1">답안 제출 시간: {drawWinner.time_taken}초</p>
                    <button 
                      onClick={() => setDrawWinner(null)}
                      className="mt-3 bg-white text-slate-800 text-xs font-bold py-1 px-4 rounded-md shadow hover:bg-slate-50 transition-colors"
                    >
                      확인 완료
                    </button>
                  </div>
                )}
              </div>

              {/* 제어 버튼 구성 */}
              <div className="flex space-x-3 text-xs">
                {!isRaffleAssigned ? (
                  <button
                    onClick={() => {
                      if (correctCount === 0) {
                        triggerAlert("배정 불가", "해당 문제의 정답자가 존재하지 않아 추첨을 구성할 수 없습니다.");
                        return;
                      }
                      setIsRaffleAssigned(true);
                      rouletteAngleRef.current = 0;
                      // 배정 직후 Canvas 초기 그리기 (setTimeout으로 DOM 업데이트 대기)
                      setTimeout(() => {
                        if (rouletteCanvasRef.current) {
                          const correctList = quizResponses.filter(r =>
                            Number(r.quiz_id) === Number(currentAdminQuizId) && r.is_correct
                          );
                          drawRouletteWheel(rouletteCanvasRef.current, correctList, 0);
                        }
                      }, 100);
                      triggerAlert("배정 완료", `정답자 ${correctCount}명이 추첨판에 성공적으로 배치되었습니다.`);
                    }}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl shadow transition-all"
                  >
                    즉석 기프티콘 추첨 시작
                  </button>
                ) : (
                  <button
                    onClick={startDrawing}
                    disabled={isDrawing}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow transition-all disabled:opacity-50"
                  >
                    {isDrawing ? "추첨 진행 중..." : "추첨시작"}
                  </button>
                )}
                
                <button
                  onClick={() => setIsRaffleModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-6 rounded-xl transition-all"
                >
                  닫기
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ===================================== */}
      {/* 퀴즈 문제 은행 편집 보드 팝업 모달     */}
      {/* ===================================== */}
      {isQuizBankModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">

            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Edit2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">퀴즈 문제 은행 편집 보드</h3>
                  <p className="text-[10px] text-slate-400">문제 추가 · 수정 · 삭제</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { openQuizModal(null); }}
                  className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center space-x-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 퀴즈 추가</span>
                </button>
                <button
                  onClick={() => setIsQuizBankModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 통계 요약 바 */}
            {(() => {
              const choiceCnt = quizList.filter(q => q.type === 'choice').length;
              const oxCnt = quizList.filter(q => q.type === 'ox').length;
              const shortCnt = quizList.filter(q => q.type === 'short').length;
              return (
                <div className="flex items-center space-x-3 px-6 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="bg-cyan-100 text-cyan-700 text-[10px] font-black px-2 py-0.5 rounded-full">객관식 {choiceCnt}문제</span>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">OX {oxCnt}문제</span>
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full">주관식 {shortCnt}문제</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs font-bold text-slate-600">총 {quizList.length}문제</span>
                </div>
              );
            })()}

            {/* 문제 목록 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {quizList.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-bold">등록된 퀴즈가 없습니다.</p>
                  <p className="text-xs mt-1">상단 '새 퀴즈 추가' 버튼으로 문제를 등록해주세요.</p>
                </div>
              )}
              {quizList.map((q, idx) => (
                <div key={q.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <span className="bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded">Q{idx + 1}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.type === 'choice' ? 'bg-cyan-100 text-cyan-700' :
                        q.type === 'ox' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {q.type === 'choice' ? '객관식' : q.type === 'ox' ? 'OX' : '주관식'}
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">{q.score}점</span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openQuizModal(q)}
                        className="flex items-center space-x-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold py-1.5 px-2.5 rounded-lg transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>수정</span>
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(q.id)}
                        className="flex items-center space-x-1 bg-white border border-rose-100 hover:bg-rose-50 text-rose-500 text-xs font-bold py-1.5 px-2.5 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>삭제</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{q.question}</p>
                  {q.type === 'choice' && q.options?.length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      {q.options.map((opt, i) => (
                        <div key={i} className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                          opt === q.answer
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}>
                          {opt === q.answer && <span className="mr-1">✅</span>}{opt}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === 'ox' && (
                    <div className="flex space-x-2 mt-1">
                      {['O', 'X'].map(opt => (
                        <div key={opt} className={`text-sm font-black px-4 py-1.5 rounded-lg border ${
                          opt === q.answer
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          {opt === q.answer && <span className="mr-1 text-xs">✅</span>}{opt}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center space-x-1 pt-1">
                    <span className="text-[10px] text-slate-400">정답:</span>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{q.answer}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 푸터 */}
            <div className="px-6 py-4 border-t border-slate-200 shrink-0 flex justify-end">
              <button
                onClick={() => setIsQuizBankModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-5 rounded-xl text-sm transition-all"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QUIZ WRITE/EDIT MODAL (ADMIN ONLY) */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl my-8">
            <h4 className="font-black text-slate-800 text-lg border-b pb-2">
              {quizEditTarget ? "퀴즈 문제 수정" : "새 퀴즈 문제 생성"}
            </h4>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">문제 유형</label>
                <select
                  value={quizFormType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setQuizFormType(newType);
                    if (newType === 'ox') {
                      setQuizFormOptions(["O", "X"]);
                      setQuizFormAnswer("O");
                    } else if (newType === 'short') {
                      setQuizFormOptions([]);
                      setQuizFormAnswer('');
                    } else {
                      setQuizFormOptions(['', '', '', '']);
                      setQuizFormAnswer('');
                    }
                  }}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-white font-bold"
                >
                  <option value="choice">객관식 (4지선다)</option>
                  <option value="ox">OX 문제</option>
                  <option value="short">주관식 텍스트</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">질문 내용 (Question)</label>
                <textarea
                  value={quizFormQuestion}
                  onChange={(e) => setQuizFormQuestion(e.target.value)}
                  placeholder="예: 공정거래법상 계약서 의무 교부 시점은?"
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:border-cyan-500 outline-none"
                />
              </div>

              {/* 1) 객관식 옵션 수정 */}
              {quizFormType === 'choice' && (
                <div className="space-y-2">
                  <label className="block text-slate-600 font-bold">4지선다 항목 채우기</label>
                  {quizFormOptions.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <span className="text-slate-400 font-bold">{i+1}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const next = [...quizFormOptions];
                          next[i] = e.target.value;
                          setQuizFormOptions(next);
                        }}
                        placeholder={`선택지 ${i+1}`}
                        className="flex-1 border border-slate-200 rounded-lg p-2 outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 2) OX 옵션 수정 */}
              {quizFormType === 'ox' && (
                <div>
                  <label className="block text-slate-600 font-bold mb-1">정답 설정</label>
                  <select
                    value={quizFormAnswer}
                    onChange={(e) => setQuizFormAnswer(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-white font-bold text-slate-700"
                  >
                    <option value="O">O</option>
                    <option value="X">X</option>
                  </select>
                </div>
              )}

              {/* 3) 주관식/일반정답 기입란 */}
              {quizFormType !== 'ox' && (
                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    {quizFormType === 'short' ? "주관식 정답 대소문자 명확히 지정" : "객관식 완벽 일치 정답 텍스트"}
                  </label>
                  <input
                    type="text"
                    value={quizFormAnswer}
                    onChange={(e) => setQuizFormAnswer(e.target.value)}
                    placeholder={quizFormType === 'short' ? "예: ESI (대문자)" : "예: 4지선다에 적은 내용 중 정답 선택지 텍스트와 100% 동일하게 기입"}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:border-cyan-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-bold mb-1">배점 설정</label>
                <input
                  type="number"
                  value={quizFormScore}
                  onChange={(e) => setQuizFormScore(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2 text-xs">
              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="flex-1 border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold py-2.5 rounded-xl transition-all"
              >
                닫기
              </button>
              <button
                onClick={handleSaveQuiz}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl transition-all"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}