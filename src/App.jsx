import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// === SUPABASE 설정 ===
// Vercel 환경변수를 사용하거나, 아래에 직접 값을 입력하세요
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
import { 
  Users, HelpCircle, BarChart3, Settings, LogIn, ChevronRight, ChevronLeft, 
  Play, RotateCcw, AlertTriangle, Plus, Trash2, Edit2, Volume2, VolumeX,
  Award, CheckCircle, X, RefreshCw, Send, Sparkles, Smile, Star, Coffee,
  Download, FileSpreadsheet
} from 'lucide-react';

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

// 조직문화 밸런스 게임 35문항 (수평 vs 수직, 효율 vs 절차, 자율 vs 규율 등)
const BALANCE_QUESTIONS = [
  { id: 1, category: "소통", text: "이상적인 리더의 의사소통 스타일은?", optionA: "명확한 탑다운 지시형", optionB: "쌍방향 합의 도출형" },
  { id: 2, category: "업무", text: "피하고 싶은 동료 유형은?", optionA: "일은 잘하지만 까칠하고 이기적인 동료", optionB: "착하고 협조적이나 일머리가 부족한 동료" },
  { id: 3, category: "성장", text: "성장을 위한 더 가치 있는 기회는?", optionA: "높은 연봉 상승을 동반한 격무 부서", optionB: "워라밸이 완벽히 보장되는 무난한 부서" },
  { id: 4, category: "자율", text: "일의 시작과 끝을 관리하는 방식 중 선호하는 것은?", optionA: "정형화된 보고 라인과 촘촘한 가이드라인", optionB: "목표 설정 후 세부 실행 과정은 전적으로 자율" },
  { id: 5, category: "효율", text: "부서 회의 진행 방식으로 더 나은 것은?", optionA: "모두가 의견을 한마디씩 내는 난상토론(30분)", optionB: "리더가 핵심 사항을 결정해 속전속결 전달(10분)" },
  { id: 6, category: "문화", text: "워크샵 프로그램으로 더 선호하는 것은?", optionA: "친밀도 형성을 위한 액티비티 및 친목 회식", optionB: "업무 인사이트 위주의 가벼운 세미나 후 빠른 퇴근" },
  { id: 7, category: "소통", text: "어려운 문제 발생 시 해결하는 경향은?", optionA: "즉시 리더에게 보고하고 가이드를 따름", optionB: "동료들과 치열하게 논의 후 최종 안을 들고 보고" },
  { id: 8, category: "업무", text: "업무 배정 시 더 선호하는 균형은?", optionA: "나의 기존 전문 영역 내에서만 안전하게 일하기", optionB: "새롭고 도전적인 미션을 도맡아 존재감 키우기" },
  { id: 9, category: "성장", text: "미래 역량 개발을 위해 필요한 교육은?", optionA: "실무에 즉시 적용 가능한 스킬셋 트레이닝", optionB: "장기적 커리어와 리더십 관점의 인문/경영 소양 교육" },
  { id: 10, category: "자율", text: "유연근무제 이용 시 가장 중시해야 할 점은?", optionA: "팀 간 협업 시간(Core-Time)의 엄격한 준수", optionB: "개인 라이프사이클에 맞춘 자율적인 시간 배치" },
  { id: 11, category: "효율", text: "업무 지시를 받을 때 더 나은 상황은?", optionA: "구체적 프로세스가 적혀있는 표준 매뉴얼 제공", optionB: "대략적인 방향성만 공유 후 즉흥적 해결책 모색" },
  { id: 12, category: "문화", text: "우리 계약실의 경조사 및 사내 행사 챙기기 수준은?", optionA: "무조건 전원 참석하여 끈끈하게 챙기는 가족형", optionB: "각자 부담 없는 선에서 자유롭게 축하하는 실속형" },
  { id: 13, category: "소통", text: "피드백을 들을 때 더 편안한 스타일은?", optionA: "핵심만 직설적으로 말해주는 팩트 폭격 피드백", optionB: "감정을 배려하며 부드럽게 돌려 말해주는 완곡 피드백" },
  { id: 14, category: "업무", text: "인수인계 시 더 끔찍한 상황은?", optionA: "문서화가 전혀 안 되어 구두로 물어보며 해결", optionB: "수천 페이지 문서를 읽어야 하지만 아무도 안 도와줌" },
  { id: 15, category: "성장", text: "평가 및 보상 체계 중 더 공정하다고 느끼는 것은?", optionA: "성과에 따른 확실한 차등 보상(개인주의적 경쟁)", optionB: "기본 기여도를 인정하는 안정 지향형 분배(팀워크)" },
  { id: 16, category: "자율", text: "휴가 상신 시 가장 편안한 상태는?", optionA: "아무 사유 없이 그냥 날짜만 정해 자동 승인", optionB: "간단한 부재중 커버 플랜을 작성하여 리더에게 승인" },
  { id: 17, category: "효율", text: "협력사 계약 협상 시 중요시하는 기조는?", optionA: "엄격한 법률 및 구매 규정 준수를 최우선으로 검토", optionB: "상황에 따라 유연하게 윈윈 방안을 도출하는 융통성" },
  { id: 18, category: "문화", text: "바람직한 사무실 소음도는?", optionA: "업무에 고도로 몰입할 수 있는 정적 상태", optionB: "가벼운 스몰토크와 웃음이 오가는 자유로운 분위기" },
  { id: 19, category: "소통", text: "팀 메신저나 슬랙 소통 시 바람직한 태도는?", optionA: "신속한 실시간 답장과 캐주얼한 리액션", optionB: "잘 정리된 내용을 시간차를 두고 진중하게 전달" },
  { id: 20, category: "업무", text: "일할 때 더 힘 빠지는 상황은?", optionA: "의미를 찾기 힘든 형식적 서류 작업의 무한 반복", optionB: "열심히 기획했는데 리더의 한 마디에 엎어지는 경우" },
  { id: 21, category: "성장", text: "사내 공모나 보직 순환에 대한 나의 생각은?", optionA: "한 분야에서 롱런하여 독보적 스페셜리스트 되기", optionB: "다양한 부서를 거치며 폭넓은 제너럴리스트 되기" },
  { id: 22, category: "자율", text: "복장 규정에 대한 개인적인 기준은?", optionA: "어느 정도 격식은 지키는 비즈니스 캐주얼 고수", optionB: "타인에게 혐오감을 주지 않는 선에서 완전 자율" },
  { id: 23, category: "효율", text: "보고서 작성 시 투자해야 하는 리소스 배분은?", optionA: "보기 좋은 떡이 먹기도 좋다 (PPT 레이아웃 및 디자인 강화)", optionB: "내용만 명확하면 된다 (원페이지 요약본 위주)" },
  { id: 24, category: "문화", text: "동료의 생일이나 기념일 축하는?", optionA: "부서원 전체가 노래를 불러주며 다 함께 케이크 파티", optionB: "기프티콘 하나로 깔끔하게 마음 전달" },
  { id: 25, category: "소통", text: "아이디어 브레인스토밍 회의 시 나의 성향은?", optionA: "정리 안 된 생각이라도 자유롭게 툭툭 던지기", optionB: "확실한 논리와 팩트가 정립된 후 신중하게 발언" },
  { id: 26, category: "업무", text: "일이 몰릴 때 마인드셋은?", optionA: "조금 무리해서라도 오늘 내로 끝내야 속이 시원함", optionB: "시간이 지나면 과부하가 걸리니 정시 퇴근 후 내일 처리" },
  { id: 27, category: "성장", text: "회사 밖에서의 자기계발에 대한 태도는?", optionA: "퇴근 후에도 관련 기술 서적이나 자격증 공부에 몰입", optionB: "퇴근 후에는 업무 생각을 완전 분리하고 철저히 휴식" },
  { id: 28, category: "자율", text: "자리 배치에 대해 더 선호하는 것은?", optionA: "지정된 내 자리에서 나만의 데스크테리어 가꾸기", optionB: "매일 원하는 자리에 자유롭게 앉는 자율 좌석제" },
  { id: 29, category: "효율", text: "결재선 지정 시 프로세스 효율성은?", optionA: "위험 방지를 위해 다수의 관련 부서를 검토선에 지정", optionB: "속도전을 위해 결재선을 단 한 두 단계로 대폭 축소" },
  { id: 30, category: "문화", text: "회식 메뉴 및 일정 선택 시?", optionA: "참석자 전원의 투표와 취향을 반영한 핫플레이스", optionB: "접근성 좋고 무난하며 빠르게 파하는 클래식 식당" },
  { id: 31, category: "소통", text: "후배 사원이 업무 실수를 했을 때 나의 태도는?", optionA: "즉시 지적하고 올바른 대안을 강력하게 훈수", optionB: "실수의 원인을 스스로 찾아내도록 질문하며 대기" },
  { id: 32, category: "업무", text: "업무가 잘 안 풀릴 때 스트레스 해소는?", optionA: "동료들과 티타임을 하며 수다로 털어내기", optionB: "혼자 산책을 하거나 음악을 들으며 생각 정리하기" },
  { id: 33, category: "성장", text: "사내 멘토링 프로그램에 대한 기대치는?", optionA: "정서적 유대와 든든한 사내 네트워크 확장", optionB: "업무 꿀팁과 실질적인 노하우 지식 습득" },
  { id: 34, category: "자율", text: "팀 공동 목표와 나의 개인 목표가 다소 충돌할 때?", optionA: "팀의 미션 달성을 위해 개인 의견을 양보하고 헌신", optionB: "나의 성향 및 방향성에 맞지 않음을 적극적으로 설득" },
  { id: 35, category: "문화", text: "주말이나 퇴근 후 부서원의 연락?", optionA: "중요한 공적인 사안이면 예의 바르게 즉각 대응", optionB: "내일 아침 출근 시 확인하는 것이 원칙 (읽씹 후 아침 대응)" }
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

export default function App() {
  const [currentView, setCurrentView] = useState('main'); 
  
  // 데이터 상태 (Supabase에서 로딩)
  const [surveyResults, setSurveyResults] = useState([]);
  const [quizList, setQuizList] = useState([]);
  const [quizResponses, setQuizResponses] = useState([]);

  // Realtime Quiz Status
  const [currentAdminQuizId, setCurrentAdminQuizId] = useState(1);
  const [adminShowAnswer, setAdminShowAnswer] = useState(false);

  // --- PART 1 STATE ---
  const [userNickname, setUserNickname] = useState('');
  const [userMbti, setUserMbti] = useState('INFJ');
  const [currentSurveyStep, setCurrentSurveyStep] = useState(0); 
  const [tempAnswers, setTempAnswers] = useState({}); 
  const [vocText, setVocText] = useState('');
  const [aiReport, setAiReport] = useState(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // --- PART 2 STATE ---
  const [quizParticipant, setQuizParticipant] = useState('');
  const [quizTimer, setQuizTimer] = useState(10);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [quizStartTime, setQuizStartTime] = useState(null);
  
  // 사운드 상태
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 추첨 관련
  const [drawWinner, setDrawWinner] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMethod, setDrawMethod] = useState('roulette'); 
  const [rouletteDegree, setRouletteDegree] = useState(0);
  const [isRaffleModalOpen, setIsRaffleModalOpen] = useState(false);
  const [isRaffleAssigned, setIsRaffleAssigned] = useState(false);

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
      if (responses) setQuizResponses(responses);
      if (status) {
        setCurrentAdminQuizId(status.current_quiz_id);
        setAdminShowAnswer(status.show_answer);
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
        setQuizResponses(prev => [...prev, payload.new]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quiz_status' }, (payload) => {
        const s = payload.new;
        setCurrentAdminQuizId(s.current_quiz_id);
        setAdminShowAnswer(s.show_answer);
        setQuizTimer(10);
        setHasSubmittedAnswer(false);
        setSelectedAnswer('');
        setQuizStartTime(Date.now());
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // 10초 카운트다운 타이머
  useEffect(() => {
    let interval;
    if (currentView === 'part2-quiz' && quizTimer > 0 && !hasSubmittedAnswer) {
      interval = setInterval(() => {
        setQuizTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setHasSubmittedAnswer(true); 
            submitQuizAnswer('시간 초과', 0);
            return 0;
          }
          if (soundEnabled) playSound('tick');
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentView, quizTimer, hasSubmittedAnswer, soundEnabled]);

  const updateAdminStatus = async (quizId, showAnswer) => {
    await supabase
      .from('quiz_status')
      .update({ current_quiz_id: quizId, show_answer: showAnswer })
      .eq('id', 1);
    setCurrentAdminQuizId(quizId);
    setAdminShowAnswer(showAnswer);
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
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""
    
    const systemPrompt = `당신은 건설산업 구매·계약 분야에 20년 이상의 경험을 보유한 수석 조직문화 전문 컨설턴트입니다. 건설사 구매계약실의 특수성(대형 협력사 계약관리, 공정거래 준수, 원가절감 압력, 수직적 보고 문화, 현장·본사 이원화 등)을 깊이 이해하고 있으며, 조직심리학·리더십 이론·구매관리(SCM) 실무를 통합적으로 적용할 수 있습니다.
제공된 정량 데이터를 근거로, 표면적 수치 이면의 구조적 원인을 진단하고 실행 가능한 처방을 제시하는 전문가 수준의 보고서를 작성하세요. 모든 분석은 Markdown 형식으로, 항목 간 논리적 인과관계가 명확히 드러나도록 서술하세요.`;

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
    [2026 구매계약실 상반기 워크샵 — 조직진단 설문 원시 데이터]
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ▶ 총 응답자: ${stats.totalParticipants}명
    ▶ MBTI 개별 분포: ${JSON.stringify(stats.mbtiCounts)}
    ▶ MBTI 그룹 요약: ${mbtiGroupAnalysis}
    ▶ 6대 부문 만족도 평점 (5점 리커트): ${JSON.stringify(stats.satisfactionScores)}
    ▶ 6대 부문 밸런스 성향 (A선택수 vs B선택수): ${JSON.stringify(stats.balanceStats)}
    ▶ 자유 VOC 원문: [${surveyResults.map(r => r.voc).filter(v => v).join(' / ')}]
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    위 데이터를 바탕으로 아래 5개 섹션을 순서대로, 건설산업 구매계약 조직의 맥락에 맞게 전문가 수준으로 작성하세요.
    각 섹션은 반드시 【】 헤더로 시작하고, 근거 없는 추측이나 상투적 표현은 일절 금지합니다.

    ---

    【섹션 1. 부문별 만족도 정밀 진단
    - 6개 부문(소통/업무/성장/자율/효율/문화) 각각에 대해 아래 형식으로 분석하세요.
    - 평점 수치 제시 → 건설 구매조직 맥락에서의 의미 해석 → 해당 점수가 낮거나 높은 구조적 원인 추론 → 방치 시 예상 리스크
    - 6개 부문 중 가장 긴급한 개선 부문 1순위와 현상 유지 강점 부문 1순위를 명시하세요.

    【섹션 2. 6대 밸런스 성향 지형도 해석
    - 각 부문의 A/B 선택 비율을 수치로 제시하고, 그 의미를 해석하세요.
    - 건설 구매계약 업무(협상·계약·원가검토·협력사 관계 등)와 연계하여 해당 성향이 실무에 미치는 영향을 분석하세요.
    - 성향 쏠림이 뚜렷한 부문(70% 이상 편향)이 있다면 특별히 강조하고, 그로 인한 조직 리스크를 짚어주세요.

    【섹션 3. MBTI 구성 분석 및 조직 역동성 진단
    - NT/NF/SJ/SP 4그룹의 비율과 현재 구매계약실 조직 운영에 미치는 영향을 분석하세요.
    - 지배적 유형이 강한 경우 나타날 수 있는 집단사고(Groupthink) 또는 갈등 패턴을 진단하세요.
    - 구매계약 업무(규정 준수·협상·창의적 문제 해결·관계관리)별로 현재 MBTI 구성의 강점과 취약 역량을 매핑하세요.

    【섹션 4. 3개 데이터 통합 종합 진단】
    - 만족도 점수 패턴 + 밸런스 성향 + MBTI 구성 + VOC를 교차 분석하여 단일 데이터로는 보이지 않는 구조적 인사이트를 도출하세요.
    - "왜 이 조직은 지금 이런 상태인가"에 대한 인과 스토리를 3~4문장으로 서술하세요.
    - VOC 키워드와 정량 데이터 간의 일치/불일치 지점을 지적하세요.

    【섹션 5. 2026 구매계약실 최우선 개선 실행과제 (Action Items)
    - 우선순위 순으로 4~5개 과제를 제시하되, 각 과제는 아래 형식을 엄수하세요.
      ◆ 과제명: (간결한 명칭)
      ◆ 배경·필요성: (왜 지금 이 과제인가 — 데이터 근거 명시)
      ◆ 구체적 실행방안: (누가, 무엇을, 어떻게 — 3단계 이상)
      ◆ 기대효과: (정량적 목표 포함 가능 시 포함)
      ◆ 추진 시 유의사항: (조직 저항 또는 실행 리스크)
`;

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
      const reportData = {
        generatedAt: new Date().toLocaleDateString(),
        content: resultText
      };
      setAiReport(reportData);
      triggerAlert("AI 분석 완료", "Gemini 가 조직개선 피드백을 완전하게 종합 분석하였습니다!");
    } catch (error) {
      console.error(error);
      triggerAlert("분석 실패", "서버 환경 오류 또는 네트워크 상태가 원활하지 않아 분석을 실패했습니다.");
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

    if (soundEnabled) {
      playSound(isCorrect ? 'success' : 'fail');
    }

    await supabase.from('quiz_responses').insert([{
      quiz_id: quiz.id,
      nickname: quizParticipant,
      quiz_id_ref: quiz.id,
      submitted_answer: answerText,
      is_correct: isCorrect,
      score_gained: scoreGained,
      time_taken: timeTaken,
      timestamp: new Date().toISOString()
    }]);
  };

  // --- 실시간 퀴즈 정답자 추첨 시뮬레이터 ---
  const startDrawing = () => {
    const currentQuiz = quizList.find(q => q.id === currentAdminQuizId) || quizList[0];
    const correctResponses = quizResponses.filter(r => r.quiz_id === currentQuiz.id && r.is_correct);
    
    if (correctResponses.length === 0) {
      triggerAlert("추첨 불가능", "해당 문제의 정답자가 존재하지 않아 추첨할 수 없습니다.");
      return;
    }

    setIsDrawing(true);
    setDrawWinner(null);
    if (soundEnabled) playSound('drumroll');

    if (drawMethod === 'roulette') {
      const extraSpin = 1440 + Math.floor(Math.random() * 360);
      setRouletteDegree(prev => prev + extraSpin);
      
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * correctResponses.length);
        const winner = correctResponses[randomIndex];
        setDrawWinner(winner);
        setIsDrawing(false);
        if (soundEnabled) playSound('success');
      }, 3000);
    } else {
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * correctResponses.length);
        const winner = correctResponses[randomIndex];
        setDrawWinner(winner);
        setIsDrawing(false);
        if (soundEnabled) playSound('success');
      }, 3000);
    }
  };

  // --- 퀴즈 명예의 전당 Top 5 산출 ---
  const calculateLeaderboard = () => {
    const scores = {};
    
    quizResponses.forEach(res => {
      if (!scores[res.nickname]) {
        scores[res.nickname] = { nickname: res.nickname, totalScore: 0, totalTime: 0, correctCount: 0 };
      }
      if (res.is_correct) {
        scores[res.nickname].totalScore += res.score_gained;
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
      setQuizResponses([]);
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
                    조직문화 건강도, 밸런스 게임 성향, 진솔한 VOC를 접수합니다. 여러분의 데이터가 실시간 AI 분석의 훌륭한 밑거름이 됩니다.
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
              <span>{currentSurveyStep + 1} / 46 ({(Math.round((currentSurveyStep + 1)/46 * 100))}% 완료)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full mb-8 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${(currentSurveyStep + 1) / 46 * 100}%` }}
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

              {/* 2. 조직문화 밸런스 게임 (10~44번 슬라이드) */}
              {currentSurveyStep >= 10 && currentSurveyStep < 45 && (() => {
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

              {/* 3. VOC 및 최종 접수 (45번 슬라이드) */}
              {currentSurveyStep === 45 && (
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
                                  <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">{cat} 차원</span>
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
                    <div className="flex items-center space-x-2 text-emerald-600 font-extrabold text-sm mb-4">
                      <Sparkles className="w-5 h-5 animate-spin" />
                      <span>Gemini 2.5 실시간 AI 리포트</span>
                    </div>
                    
                    {isAiAnalyzing ? (
                      <div className="space-y-4 py-8 text-center text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                        <p className="text-sm font-semibold">Gemini가 최신 조직평가 기법을 기반으로<br/>구매계약실 데이터셋을 분석하는 중입니다...</p>
                      </div>
                    ) : aiReport ? (
                      <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed text-xs pr-2 space-y-3">
                        <div className="text-[10px] text-slate-400 font-bold mb-2">분석일자: {aiReport.generatedAt}</div>
                        {aiReport.content.split('\n').map((line, idx) => {
                          if (line.startsWith('【') || line.startsWith('###') || line.startsWith('**') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
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
                onClick={() => {
                  if(!quizParticipant.trim()) {
                    triggerAlert("이름 필요", "실명 기반의 닉네임을 적어주세요!");
                    return;
                  }
                  setHasSubmittedAnswer(false);
                  setSelectedAnswer('');
                  setQuizTimer(10);
                  setQuizStartTime(Date.now());
                  setCurrentView('part2-quiz');
                }}
                className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:brightness-105 transition-all"
              >
                대기열 진입 및 퀴즈 시작
              </button>
            </div>
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
                    <p className="text-xs text-cyan-600 font-bold mt-2">선택한 답안: {selectedAnswer}</p>
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
                              onClick={() => setSelectedAnswer(opt)}   // ← 선택만 함
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
                              onClick={() => setSelectedAnswer(opt)}   // ← 선택만 함
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

                    {/* 3) 주관식 유형 — 기존과 동일 */}
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
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                  <div className="flex items-center space-x-2 text-emerald-700 font-extrabold text-sm mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>출제자 정답 공개</span>
                  </div>
                  <p className="text-base font-bold text-emerald-900">정답은 바로 [ {currentQuiz.answer} ] 입니다!</p>
                  <p className="text-xs text-emerald-600 mt-1">내가 입력한 답: {selectedAnswer} {selectedAnswer === currentQuiz.answer ? '⭕ (정답)' : '❌ (오답)'}</p>
                </div>
              )}

              {/* 멀티플레이 시뮬레이터 안내 탭: 화살표 문자 에스케이프 처리 완료 */}
              <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-center text-xs text-slate-500">
                <p>💡 <b>[멀티플레이어 데모 안내]</b> 이 페이지를 새로운 브라우저 탭(창)으로 하나 더 열고, <br/> 
                새 창에서 <b>[관리자 로그인 {"->"} 어드민 대시보드]</b>에 접속하면 실시간으로 문제를 주도 및 전환하고 추첨을 즐기실 수 있습니다!</p>
              </div>

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
                      const responsesForQ = quizResponses.filter(r => r.quiz_id === q.id);
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
                  <div className="pt-2">
                    <button
                      onClick={requestAiAnalysis}
                      disabled={surveyResults.length === 0 || isAiAnalyzing}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-sm hover:brightness-105 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      {isAiAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>{isAiAnalyzing ? "AI 분석가 가동 중..." : "AI 결과 종합 분석 요청"}</span>
                    </button>
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
            {/* PART 2. 워크숍 수료 평가 퀴즈 통제 섹션      */}
            {/* ========================================== */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
                <h4 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5 text-cyan-500" />
                  <span>PART 2. 워크숍 수료 평가 퀴즈 통제</span>
                </h4>
                
                {/* 파트 2 초기화 버튼을 헤더 옆 컴팩트하게 배치 */}
                <button
                  onClick={resetPart2Data}
                  className="bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-extrabold py-1.5 px-3 rounded-lg transition-all flex items-center space-x-1.5 self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>파트 2 퀴즈 및 랭킹 데이터 초기화</span>
                </button>
              </div>

              {/* 어드민 세션 분할 배치 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 세션 A: 실시간 라이브 퀴즈 송출 상황판 (2칸 차지) */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="font-bold text-slate-800 text-lg flex items-center space-x-1.5">
                      <Play className="w-5 h-5 text-cyan-500" />
                      <span>실시간 라이브 퀴즈 송출 패널</span>
                    </h4>
                    <span className="bg-cyan-50 text-cyan-600 text-xs font-black px-2.5 py-1 rounded">LIVE CONTROL</span>
                  </div>

                  {/* 현재 활성 퀴즈 정보 */}
                  {(() => {
                    const activeQuiz = quizList.find(q => q.id === currentAdminQuizId) || quizList[0];
                    if (!activeQuiz) return <p className="text-slate-400 text-xs">등록된 퀴즈가 없습니다.</p>;

                    const totalResponses = quizResponses.filter(r => r.quiz_id === activeQuiz.id).length;
                    const correctResponses = quizResponses.filter(r => r.quiz_id === activeQuiz.id && r.is_correct).length;

                    return (
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="bg-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">현재 전송 중</span>
                            <h5 className="font-extrabold text-slate-800 text-base mt-2">Q{activeQuiz.id}. {activeQuiz.question}</h5>
                            <p className="text-xs text-slate-400 mt-1">정답: {activeQuiz.answer} / 배점: {activeQuiz.score}점 / 유형: {activeQuiz.type === 'choice' ? '객관식' : activeQuiz.type === 'ox' ? 'OX' : '주관식'}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
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

                          <div className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-slate-600 flex items-center space-x-1.5">
                            <span>현재 제출 완료인원:</span>
                            <span className="text-cyan-600">{totalResponses}명</span>
                          </div>
                        </div>

                        {/* 정답 비율 미니 차트 */}
                        {totalResponses > 0 && (
                          <div className="bg-white border border-slate-200/80 p-3 rounded-lg text-xs space-y-2">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-500">실시간 정확도</span>
                              <span className="text-emerald-600">{Math.round((correctResponses/totalResponses)*100)}% ({correctResponses}/{totalResponses}명)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${(correctResponses/totalResponses)*100}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 퀴즈 셀렉터 (문제 교체) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">원격 송출 문제 선택</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {quizList.map(q => (
                        <button
                          key={q.id}
                          onClick={() => {
                            if (window.confirm(`Q${q.id} 번 문제를 정말로 실시간 송출하시겠습니까?`)) {
                              updateAdminStatus(q.id, false);
                            }
                          }}
                          className={`py-2 px-3 text-xs font-black rounded-lg border text-left transition-all
                            ${currentAdminQuizId === q.id 
                              ? 'bg-cyan-500 border-cyan-500 text-white shadow-sm' 
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
                        >
                          Q{q.id} 송출 개시
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* 세션 B: 퀴즈 문제 은행 리스트 관리 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="font-bold text-slate-800 text-base">퀴즈 문제 은행 편집 보드</h4>
                    <button 
                      onClick={() => openQuizModal(null)}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>새 퀴즈 추가</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {quizList.map(q => (
                      <div key={q.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                        <div>
                          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                            <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded">Q{q.id}</span>
                            <span className="bg-cyan-100 text-cyan-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              {q.type === 'choice' ? '객관식' : q.type === 'ox' ? 'OX' : '주관식'}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{q.question.slice(0, 30)}...</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">정답: {q.answer} / 배점: {q.score}점</p>
                        </div>

                        <div className="flex space-x-1">
                          <button 
                            onClick={() => openQuizModal(q)}
                            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteQuiz(q.id)}
                            className="p-1.5 hover:bg-rose-100 text-rose-500 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* 세션 C: 즉석 추첨기 게이트웨이 */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="border-b pb-3">
                    <h4 className="font-bold text-slate-800 text-base">정답자 실시간 즉석 추첨기</h4>
                    <p className="text-xs text-slate-400 mt-1">실시간 퀴즈 정답자들을 대상으로 한 즉석 기프티콘 추첨 모듈입니다.</p>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-slate-500 space-y-2">
                    <p className="font-bold text-slate-700">📌 추첨 안내</p>
                    <p>- 현재 송출된 퀴즈의 정답자 명단을 추출하여 추첨 팝업 창을 엽니다.</p>
                    <p>- 팝업 창 내에서 룰렛/사다리 배정 및 추첨을 제어할 수 있습니다.</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsRaffleModalOpen(true);
                      setIsRaffleAssigned(false);
                      setDrawWinner(null);
                    }}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-xl shadow transition-all flex items-center justify-center space-x-1.5"
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
        const responsesForQ = quizResponses.filter(r => r.quiz_id === currentQuiz?.id);
        const correctResponses = responsesForQ.filter(r => r.is_correct);
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
                  <div className="text-center py-6 text-slate-400 space-y-2">
                    <Users className="w-12 h-12 mx-auto text-slate-300 animate-bounce" />
                    <p className="font-bold text-base text-slate-500">추첨 판이 준비되지 않았습니다.</p>
                    <p className="text-xs">하단 '즉석 기프티콘 추첨 시작' 버튼을 눌러 정답자를 먼저 배정해주세요.</p>
                  </div>
                ) : drawMethod === 'roulette' ? (
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-52 h-52 rounded-full border-4 border-dashed border-cyan-500 flex flex-col items-center justify-center font-black text-xs bg-white text-cyan-600 shadow-inner transition-transform duration-[3000ms] ease-out relative overflow-hidden"
                      style={{ transform: `rotate(${rouletteDegree}deg)` }}
                    >
                      <div className="absolute inset-0 flex flex-wrap items-center justify-center p-4 content-center bg-radial-gradient">
                        {correctResponses.map((r, idx) => (
                          <span 
                            key={idx} 
                            className="text-[9px] font-extrabold text-slate-800 bg-cyan-100/90 px-1.5 py-0.5 rounded m-0.5 shadow-xs border border-cyan-200/50"
                          >
                            {r.nickname}
                          </span>
                        ))}
                      </div>
                    </div>
                    <svg className="w-8 h-8 text-rose-500 -mt-3 z-10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3l8 14H4z" />
                    </svg>
                  </div>
                ) : (
                  <div className="space-y-4 w-full text-center">
                    <div className="flex justify-around items-end h-44 w-full px-4 border-b border-dashed border-slate-200 pb-2">
                      {correctResponses.slice(0, 10).map((r, i) => (
                        <div key={i} className="w-2 bg-cyan-400 h-full rounded relative flex flex-col justify-between items-center">
                          <span className="absolute -top-10 text-[9px] font-black text-slate-700 bg-white px-2 py-0.5 border border-cyan-200 rounded shadow-xs whitespace-nowrap z-10">
                            {r.nickname}
                          </span>
                          <div className="absolute top-8 -left-4 -right-4 h-1 bg-slate-300" />
                          <div className="absolute top-20 -left-4 -right-4 h-1 bg-slate-300" />
                          <div className="absolute top-32 -left-4 -right-4 h-1 bg-slate-300" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 block font-bold">LADDER GAME ACTIVE ({correctCount}명 배정)</span>
                  </div>
                )}

                {isDrawing && (
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