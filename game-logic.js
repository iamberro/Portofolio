// Nama file: game-logic.js

let gameData = {};

function startQuestion(teamId = null, questionNumber) {
    const currentRoundRules = gameData.rounds.find(r => r.roundNumber === gameData.currentRound);
    if (!gameData.liveQuestion) {
        gameData.liveQuestion = {
            roundNumber: gameData.currentRound,
            type: currentRoundRules.type,
            teamId: teamId,
            questionNumber: questionNumber,
            timer: currentRoundRules.timer,
            status: 'live',
            // --- LOGIKA TIMER BARU ---
            timer_state: 'inactive', // 'inactive', 'running', 'paused'
            time_left: null          // Untuk menyimpan sisa waktu saat dijeda
        };
        saveGameData();
    }
}

function toggleTimer() {
    if (gameData.liveQuestion) {
        const currentState = gameData.liveQuestion.timer_state;

        if (currentState === 'inactive' || currentState === 'paused') {
            gameData.liveQuestion.timer_state = 'running';
        } else if (currentState === 'running') {
            gameData.liveQuestion.timer_state = 'paused';
        }
        saveGameData();
    }
}


function endQuestion() {
    if (gameData.liveQuestion) {
        gameData.liveQuestion = null;
        saveGameData();
    }
}

function assignBankToTeam(teamId, bankId) {
    const team = gameData.teams.find(t => t.id === teamId);
    if(team) {
        const roundKey = `round${gameData.currentRound}`;
        team.bankAssignments[roundKey] = bankId;
        const bank = gameData.questionBanks.find(b => b.id === bankId);
        if (bank) {
            team.answers[roundKey] = Array(bank.questions.length).fill('-');
        } else {
            team.answers[roundKey] = Array(50).fill('-');
        }
        saveGameData();
        return true;
    }
    return false;
}

function recordSingleAnswer(teamId, questionNumber, isCorrect) {
    const currentRoundRules = gameData.rounds.find(r => r.roundNumber === gameData.currentRound);
    if (!currentRoundRules) return console.error("Aturan ronde tidak ditemukan!");

    const roundType = currentRoundRules.type;
    const questionIndex = questionNumber - 1;

    // --- PERBAIKAN BUG REBUTAN ---
    // Cek dulu apakah soal ini di babak rebutan sudah ada yang menjawab benar.
    if (roundType === 'rebutan') {
        let isQuestionClosed = false;
        gameData.teams.forEach(team => {
            if (team.answers[`round${gameData.currentRound}`][questionIndex] === 'O') {
                isQuestionClosed = true;
            }
        });

        if (isQuestionClosed) {
            alert("Soal ini sudah dijawab dengan benar dan ditutup. Tidak bisa mencatat jawaban lain.");
            return; // Hentikan fungsi jika soal sudah terkunci
        }
    }
    // --- AKHIR PERBAIKAN ---

    let maxQuestions;
    const teamToUpdate = gameData.teams.find(t => t.id === teamId);
    if (!teamToUpdate) return console.error("Tim tidak ditemukan!");

    if(roundType === 'wajib') {
        const assignedBankId = teamToUpdate.bankAssignments[`round${gameData.currentRound}`];
        if (assignedBankId) {
            const bank = gameData.questionBanks.find(b => b.id === assignedBankId);
            if (bank) maxQuestions = bank.questions.length;
        } else {
            alert(`Tim ${teamToUpdate.name} belum diberi Bank Soal untuk ronde ini!`);
            return;
        }
    } else { // Rebutan
        maxQuestions = currentRoundRules.numQuestions;
    }
    
    if (questionIndex < 0 || questionIndex >= maxQuestions) {
        alert(`Nomor soal ${questionNumber} tidak valid untuk tim/ronde ini! (Hanya 1 s/d ${maxQuestions})`);
        return;
    }

    if (teamToUpdate.answers[`round${gameData.currentRound}`][questionIndex] === '-') {
        if (isCorrect) {
            teamToUpdate.score += currentRoundRules.pointsCorrect;
        } else {
            teamToUpdate.score += currentRoundRules.pointsIncorrect;
        }
        teamToUpdate.answers[`round${gameData.currentRound}`][questionIndex] = isCorrect ? 'O' : 'X';
        
        if (gameData.liveQuestion) {
            if (gameData.liveQuestion.type === 'wajib' || isCorrect) {
                 gameData.liveQuestion.status = isCorrect ? 'answered_correct' : 'answered_wrong';
            }
           
            if (gameData.liveQuestion.type === 'rebutan') {
                gameData.liveQuestion.answeringTeamId = teamId;
            }
        }
        
        saveGameData();
    } else {
        alert(`${teamToUpdate.name} sudah pernah menjawab soal no. ${questionNumber}. Gunakan fitur 'Reset Jawaban' jika ingin mengubah.`);
    }
}

function resetQuestion(questionNumber, teamId = null) {
    const currentRoundRules = gameData.rounds.find(r => r.roundNumber === gameData.currentRound);
    const questionIndex = questionNumber - 1;
    if (questionIndex < 0) return alert(`Nomor soal tidak valid!`);

    const teamsToReset = teamId ? [gameData.teams.find(t => t.id === teamId)] : gameData.teams;

    teamsToReset.forEach(team => {
        if (!team) return;
        
        const answer = team.answers[`round${gameData.currentRound}`][questionIndex];
        if (answer === 'O') {
            team.score -= currentRoundRules.pointsCorrect;
        } else if (answer === 'X') {
            team.score -= currentRoundRules.pointsIncorrect;
        }
        team.answers[`round${gameData.currentRound}`][questionIndex] = '-';
    });
    
    if (gameData.liveQuestion && gameData.liveQuestion.questionNumber === questionNumber) {
        gameData.liveQuestion.status = 'live';
        delete gameData.liveQuestion.answeringTeamId;
    }

    saveGameData();
    alert(`Penilaian untuk Soal No. ${questionNumber} telah berhasil direset!`);
}

function adjustScore(teamId, amount) {
    if (!teamId || isNaN(amount)) {
        alert('Pilih tim dan masukkan jumlah poin yang valid.');
        return false;
    }
    const teamToUpdate = gameData.teams.find(t => t.id === teamId);
    if (teamToUpdate) {
        const oldScore = teamToUpdate.score;
        teamToUpdate.score += amount;
        saveGameData();
        alert(`Skor untuk ${teamToUpdate.name} berhasil diubah.\nSkor Lama: ${oldScore}\nPerubahan: ${amount > 0 ? '+' : ''}${amount}\nSkor Baru: ${teamToUpdate.score}`);
        return true;
    } else {
        alert('Tim tidak ditemukan!');
        return false;
    }
}

// --- FUNGSI BARU ---
function previousRound() {
    if (gameData.currentRound > 1) {
        gameData.currentRound--;
        gameData.status = 'playing'; // Pastikan status kembali 'playing'
        endQuestion();
        saveGameData();
    } else {
        alert("Ini sudah ronde pertama!");
    }
}

// --- FUNGSI nextRound SEDIKIT DIMODIFIKASI ---
function nextRound() {
    if (gameData.currentRound < gameData.rounds.length) {
        gameData.currentRound++;
        endQuestion(); // Pastikan tidak ada soal live yang terbawa ke ronde berikutnya
        saveGameData();
    } else {
        gameData.status = 'finished';
        endQuestion();
        saveGameData();
        alert("Permainan Selesai! Cek Leaderboard untuk melihat pemenang.");
    }
}

function saveGameData() {
    localStorage.setItem('quizGameData', JSON.stringify(gameData));
}

function loadGameData() {
    const savedData = localStorage.getItem('quizGameData');
    if (savedData) { 
        gameData = JSON.parse(savedData); 
        if (typeof gameData.liveQuestion === 'undefined') {
            gameData.liveQuestion = null;
        }
        return true; 
    } 
    else { 
        alert("Data game tidak ditemukan! Mengarahkan ke halaman setup."); 
        window.location.href = 'setup.html'; 
        return false; 
    }
}