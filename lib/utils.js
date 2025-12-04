// 結果計算ロジック (3モード対応)
export const calculateResult = (answers, results, mode = 'diagnosis') => {
  // 1. テストモード (Education)
  if (mode === 'test') {
    // 正解数（score.A が 1 のもの）をカウント
    let correctCount = 0;
    Object.values(answers).forEach(option => {
      if (option.score && option.score.A === 1) {
        correctCount++;
      }
    });
    
    // 正解率を計算 (0.0 ~ 1.0)
    const totalQuestions = Object.keys(answers).length;
    const ratio = totalQuestions === 0 ? 0 : correctCount / totalQuestions;

    // 結果パターン（上から順に 高得点・中得点・低得点 と仮定）
    // results[0]: 80%以上 (A)
    // results[1]: 40%以上 (B)
    // results[2]: それ以下 (C)
    if (ratio >= 0.8) return { ...results[0], score: correctCount, total: totalQuestions };
    if (ratio >= 0.4) return { ...results[1], score: correctCount, total: totalQuestions };
    return { ...results[2], score: correctCount, total: totalQuestions };
  }

  // 2. 占いモード (Fortune) - 完全ランダム
  if (mode === 'fortune') {
    const randomIndex = Math.floor(Math.random() * results.length);
    return results[randomIndex];
  }

  // 3. 診断モード (Business/Default) - ポイント加算方式
  const scores = { A: 0, B: 0, C: 0 };
  Object.values(answers).forEach(option => {
    if (option.score) {
      Object.entries(option.score).forEach(([type, point]) => {
        scores[type] = (scores[type] || 0) + (parseInt(point, 10) || 0);
      });
    }
  });
  let maxType = 'A';
  let maxScore = -1;
  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxType = type;
    }
  });
  return results.find(r => r.type === maxType) || results[0];
};

export const generateSlug = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({length: 5}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};