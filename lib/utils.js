// 結果計算ロジック (3モード対応 & 動的ランク判定)
export const calculateResult = (answers, results, mode = 'diagnosis') => {
  // 1. テストモード (Education)
  if (mode === 'test') {
    // 正解数カウント
    let correctCount = 0;
    Object.values(answers).forEach(option => {
      if (option.score && option.score.A === 1) {
        correctCount++;
      }
    });
    
    // 正解率 (0.0 ~ 1.0)
    const totalQuestions = Object.keys(answers).length;
    const ratio = totalQuestions === 0 ? 0 : correctCount / totalQuestions;

    // 結果パターンの数に合わせてランクを決定
    // 例: 結果が3つなら、1.0(満点)は index 0, 0.0(0点)は index 2
    // 数式: (1 - ratio) * (個数 - 1) ではなく、分布を作るために少し調整
    let resultIndex = Math.floor((1 - ratio) * results.length);
    
    // 満点(ratio=1.0)の場合、計算結果が0になるが、念のためクランプ
    if (ratio === 1) resultIndex = 0;
    // 範囲外防止
    if (resultIndex >= results.length) resultIndex = results.length - 1;

    return { ...results[resultIndex], score: correctCount, total: totalQuestions };
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